import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue, QueryDocumentSnapshot, DocumentData } from "firebase-admin/firestore";

// Get Cashfree credentials
const clientId = process.env.CASHFREE_CLIENT_ID?.trim() || "";
const secretKey = process.env.CASHFREE_SECRET_KEY?.trim() || "";
const envMode = process.env.CASHFREE_ENV?.trim();
const baseApiUrl = envMode === "PRODUCTION"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";

export async function POST(request: NextRequest) {
    try {
        const { order_id } = await request.json();

        if (!order_id) {
            return NextResponse.json(
                { error: "Order ID is required" },
                { status: 400 }
            );
        }

        // Check if adminDb is properly initialized
        if (!adminDb || typeof adminDb.collection !== 'function') {
            console.error("Firebase Admin not properly initialized");
            return NextResponse.json(
                { error: "Database not configured" },
                { status: 500 }
            );
        }

        // First verify the payment status with Cashfree
        const cfResponse = await fetch(`${baseApiUrl}/orders/${order_id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-api-version": "2025-01-01",
                "x-client-id": clientId,
                "x-client-secret": secretKey,
            },
        });

        const cfData = await cfResponse.json();

        if (!cfResponse.ok) {
            console.error("Cashfree API error:", cfData);
            return NextResponse.json(
                { error: "Failed to verify with Cashfree", details: cfData },
                { status: cfResponse.status }
            );
        }

        console.log("Cashfree order status:", cfData.order_status);

        // Only update if payment is confirmed PAID
        if (cfData.order_status !== "PAID") {
            return NextResponse.json({
                success: false,
                message: "Payment not confirmed yet",
                order_status: cfData.order_status,
            });
        }

        // Fetch payment details to get transaction ID
        let cfPaymentId = null;
        let paymentMethod = null;
        let paymentTime = null;
        try {
            const paymentsResponse = await fetch(`${baseApiUrl}/orders/${order_id}/payments`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-version": "2025-01-01",
                    "x-client-id": clientId,
                    "x-client-secret": secretKey,
                },
            });

            if (paymentsResponse.ok) {
                const paymentsData = await paymentsResponse.json();
                // Get the successful payment (usually the first one with SUCCESS status)
                const successfulPayment = paymentsData.find((p: any) => p.payment_status === "SUCCESS") || paymentsData[0];
                if (successfulPayment) {
                    cfPaymentId = successfulPayment.cf_payment_id;
                    paymentMethod = successfulPayment.payment_method;
                    paymentTime = successfulPayment.payment_time;
                    console.log("Payment details fetched:", { cfPaymentId, paymentMethod });
                }
            }
        } catch (paymentError) {
            console.error("Failed to fetch payment details:", paymentError);
            // Continue without payment details - not critical
        }

        // Find all orders with this cfOrderId
        const ordersSnapshot = await adminDb
            .collection("orders")
            .where("cfOrderId", "==", order_id)
            .get();

        if (ordersSnapshot.empty) {
            console.error("No orders found for cfOrderId:", order_id);
            return NextResponse.json(
                { error: "No orders found for this order ID" },
                { status: 404 }
            );
        }

        const batch = adminDb.batch();
        const stockUpdates: { category: string; productId: string; quantity: number }[] = [];
        let alreadyUpdated = false;

        ordersSnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
            const orderData = doc.data();

            // Skip if already paid
            if (orderData.paymentStatus === "paid") {
                alreadyUpdated = true;
                return;
            }

            // Update order status - Payment successful, awaiting admin confirmation
            const updateData: Record<string, any> = {
                paymentStatus: "paid",
                orderStatus: "placed",  // Order Placed - awaiting admin confirmation
                status: "placed",       // Legacy field for compatibility
                updatedAt: FieldValue.serverTimestamp(),
                timeline: FieldValue.arrayUnion({
                    timestamp: new Date(),
                    event: "Payment Successful",
                    description: "Payment verified. Order placed, awaiting admin confirmation.",
                    actor: "system"
                })
            };

            // Add Cashfree payment details if available
            if (cfPaymentId) updateData.cfPaymentId = cfPaymentId;
            if (paymentMethod) updateData.paymentMethod = paymentMethod;
            if (paymentTime) updateData.paymentTime = paymentTime;

            batch.update(doc.ref, updateData);

            // Collect stock updates
            if (orderData.productCategory && orderData.productId) {
                stockUpdates.push({
                    category: orderData.productCategory,
                    productId: orderData.productId,
                    quantity: orderData.quantity || 1,
                });
            }
        });

        // If already updated, just return success
        if (alreadyUpdated) {
            return NextResponse.json({
                success: true,
                message: "Order already placed",
                updated: 0,
            });
        }

        // Commit order updates
        await batch.commit();
        console.log(`Updated ${ordersSnapshot.size} orders to paid/placed`);

        // Deduct stock for each product
        for (const update of stockUpdates) {
            try {
                const productRef = adminDb.collection(update.category).doc(update.productId);
                const productDoc = await productRef.get();

                if (productDoc.exists) {
                    const currentStock = productDoc.data()?.stock || 0;
                    const newStock = Math.max(0, currentStock - update.quantity);

                    await productRef.update({ stock: newStock });
                    console.log(`Deducted ${update.quantity} from ${update.category}/${update.productId}, new stock: ${newStock}`);
                }
            } catch (stockError) {
                console.error(`Error updating stock for ${update.productId}:`, stockError);
            }
        }

        return NextResponse.json({
            success: true,
            message: "Order placed successfully",
            updated: ordersSnapshot.size,
        });
    } catch (error) {
        console.error("Update order status error:", error);
        return NextResponse.json(
            { error: "Failed to update order status" },
            { status: 500 }
        );
    }
}
