import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue, QueryDocumentSnapshot, DocumentData, Transaction, DocumentSnapshot } from "firebase-admin/firestore";

// Get Cashfree credentials (trim whitespace)
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
        let paymentAmount = null;
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
                // Get the successful payment
                const successfulPayment = paymentsData.find((p: any) => p.payment_status === "SUCCESS") || paymentsData[0];
                if (successfulPayment) {
                    cfPaymentId = successfulPayment.cf_payment_id;
                    paymentMethod = successfulPayment.payment_method;
                    paymentTime = successfulPayment.payment_time;
                    paymentAmount = successfulPayment.payment_amount;
                    console.log("Payment details fetched:", { cfPaymentId, paymentMethod });
                }
            }
        } catch (paymentError) {
            console.error("Failed to fetch payment details:", paymentError);
        }

        // Use a Firestore Transaction to ensure atomic processing
        // This prevents duplicate orders if webhook and return page hit simultaneously
        const pendingOrderRef = adminDb.collection("pending_orders").doc(order_id);

        try {
            const transactionResult = await adminDb.runTransaction(async (t: Transaction) => {
                // 1. Try to read pending order
                const pendingDoc = (await t.get(pendingOrderRef)) as unknown as DocumentSnapshot;

                if (!pendingDoc.exists) {
                    // Pending order gone? It means either:
                    // A) Already processed by another request
                    // B) Never existed/Expired
                    // We can check if actual orders exist to confirm (A)
                    return { status: "ALREADY_PROCESSED_OR_MISSING" };
                }

                const pendingOrder = pendingDoc.data()!;
                const createdOrderIds: string[] = [];
                const stockUpdates: { category: string; productId: string; quantity: number }[] = [];

                // 2. Create actual orders
                for (const item of pendingOrder.orderItems) {
                    const now = new Date();
                    const dateStr = now.getFullYear().toString() +
                        (now.getMonth() + 1).toString().padStart(2, '0') +
                        now.getDate().toString().padStart(2, '0');
                    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
                    const orderId = `SC-${dateStr}-${randomPart}`;

                    // Create a reference for the new order
                    const newOrderRef = adminDb.collection("orders").doc();

                    const orderDocument: Record<string, any> = {
                        orderId,
                        cfOrderId: order_id,
                        productId: item.productId,
                        productName: item.productName,
                        productImage: item.productImage,
                        productCategory: item.productCategory,
                        partNumber: item.partNumber,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        windowsInstallation: item.windowsInstallation || false,
                        totalAmount: item.totalAmount,
                        customerId: pendingOrder.customerId,
                        customerEmail: pendingOrder.customerEmail,
                        customerName: pendingOrder.customerName,
                        phone: pendingOrder.phone,
                        address: pendingOrder.fullAddress,
                        shippingAddress: pendingOrder.shippingAddress,
                        paymentMethod: "online",
                        paymentStatus: "paid",
                        orderStatus: "placed",
                        status: "placed",
                        createdAt: FieldValue.serverTimestamp(),
                        updatedAt: FieldValue.serverTimestamp(),
                        timeline: [{
                            timestamp: new Date(),
                            event: "Order Created",
                            description: "Payment successful. Order placed, awaiting admin confirmation.",
                            actor: "system"
                        }]
                    };

                    if (item.windowsInstallation && item.windowsInstallationPrice) {
                        orderDocument.windowsInstallationPrice = item.windowsInstallationPrice;
                    }
                    if (item.carePack) {
                        orderDocument.carePack = item.carePack;
                    }
                    if (cfPaymentId) orderDocument.cfPaymentId = cfPaymentId;
                    if (paymentMethod) orderDocument.paymentMethod = paymentMethod;
                    if (paymentTime) orderDocument.paymentTime = paymentTime;
                    if (paymentAmount) orderDocument.paymentAmount = paymentAmount;

                    // Write to transaction
                    t.set(newOrderRef, orderDocument);
                    createdOrderIds.push(orderId);

                    stockUpdates.push({
                        category: item.productCategory,
                        productId: item.productId,
                        quantity: item.quantity,
                    });
                }

                // 3. Delete the pending order (This is the key lock mechanism)
                t.delete(pendingOrderRef);

                return { status: "CREATED", createdOrderIds, stockUpdates };
            });

            // Handle transaction result
            if (transactionResult.status === "ALREADY_PROCESSED_OR_MISSING") {
                console.log("Order already processed or pending order missing:", order_id);
                // We can optionally verify if orders exist in 'orders' to be sure
                const checkOrders = await adminDb.collection("orders").where("cfOrderId", "==", order_id).get();
                if (!checkOrders.empty) {
                    return NextResponse.json({
                        success: true,
                        message: "Order already placed (deduplicated)",
                        updated: 0
                    });
                } else {
                    return NextResponse.json(
                        { error: "Order details not found. Please contact support." },
                        { status: 404 }
                    );
                }
            }

            if (transactionResult.status === "CREATED") {
                console.log("Orders created successfully via transaction");

                // Handle stock updates AFTER transaction (to keep transaction light and less prone to contention)
                const { stockUpdates } = transactionResult;
                if (stockUpdates) {
                    for (const update of stockUpdates) {
                        try {
                            const productRef = adminDb.collection(update.category).doc(update.productId);
                            await adminDb.runTransaction(async (t: Transaction) => {
                                const doc = (await t.get(productRef)) as unknown as DocumentSnapshot;
                                if (doc.exists) {
                                    const current = doc.data()?.stock || 0;
                                    t.update(productRef, { stock: Math.max(0, current - update.quantity) });
                                }
                            });
                            console.log(`Deducted ${update.quantity} from ${update.category}/${update.productId}`);
                        } catch (stockError) {
                            console.error(`Error updating stock for ${update.productId}:`, stockError);
                        }
                    }
                }

                return NextResponse.json({
                    success: true,
                    message: "Order placed successfully",
                    created: transactionResult.createdOrderIds?.length || 0,
                    orderIds: transactionResult.createdOrderIds
                });
            }

        } catch (transactionError) {
            console.error("Transaction failed:", transactionError);
            return NextResponse.json(
                { error: "Transaction failed during order creation" },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error("Update order status error:", error);
        return NextResponse.json(
            { error: "Failed to update order status" },
            { status: 500 }
        );
    }
}
