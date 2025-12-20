import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { adminDb } from "@/lib/firebase-admin";
import { QueryDocumentSnapshot, DocumentData } from "firebase-admin/firestore";

// Verify Cashfree webhook signature (2025-01-01 API version)
function verifyWebhookSignature(
    payload: string,
    signature: string,
    secretKey: string
): boolean {
    try {
        const expectedSignature = crypto
            .createHmac("sha256", secretKey)
            .update(payload)
            .digest("base64");

        return signature === expectedSignature;
    } catch {
        return false;
    }
}

// Set to true in production to reject invalid signatures
const STRICT_SIGNATURE_VERIFICATION = false;

export async function POST(request: NextRequest) {
    try {
        // Check if adminDb is properly initialized
        if (!adminDb || typeof adminDb.collection !== 'function') {
            console.error("Firebase Admin not properly initialized for webhooks");
            return NextResponse.json(
                { error: "Database not configured" },
                { status: 500 }
            );
        }

        const signature = request.headers.get("x-webhook-signature");
        const timestamp = request.headers.get("x-webhook-timestamp");

        if (!signature || !timestamp) {
            console.error("Missing webhook signature or timestamp");
            return NextResponse.json(
                { error: "Missing webhook headers" },
                { status: 400 }
            );
        }

        const rawBody = await request.text();

        // Per Cashfree docs: webhook signature uses Client Secret, NOT webhook secret
        const clientSecret = process.env.CASHFREE_SECRET_KEY?.trim();

        if (!clientSecret) {
            console.error("CASHFREE_SECRET_KEY not configured for webhook verification");
            return NextResponse.json(
                { error: "Secret key not configured" },
                { status: 500 }
            );
        }

        // Verify signature using timestamp + body format
        const dataToSign = timestamp + rawBody;
        const isValid = verifyWebhookSignature(dataToSign, signature, clientSecret);

        if (!isValid) {
            console.warn("Webhook signature verification failed");

            if (STRICT_SIGNATURE_VERIFICATION) {
                console.error("Rejecting webhook due to invalid signature (strict mode)");
                return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
            } else {
                console.warn("Processing webhook despite signature mismatch (dev mode)");
            }
        } else {
            console.log("Webhook signature verified successfully");
        }

        const webhookData = JSON.parse(rawBody);
        const { type, data } = webhookData;

        console.log("Cashfree webhook received:", type);

        // Handle different webhook event types
        switch (type) {
            case "PAYMENT_SUCCESS_WEBHOOK":
                await handlePaymentSuccess(data);
                break;
            case "PAYMENT_FAILED_WEBHOOK":
                await handlePaymentFailed(data);
                break;
            case "PAYMENT_USER_DROPPED_WEBHOOK":
                await handlePaymentDropped(data);
                break;
            default:
                console.log("Unhandled webhook type:", type);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Webhook processing error:", error);
        return NextResponse.json(
            { error: "Webhook processing failed" },
            { status: 500 }
        );
    }
}

interface PaymentSuccessData {
    order: {
        order_id: string;
        order_amount: number;
        order_currency: string;
    };
    payment: {
        cf_payment_id: string;
        payment_status: string;
        payment_amount: number;
        payment_method: { [key: string]: unknown };
        payment_time: string;
    };
}

interface PaymentFailedData {
    order: { order_id: string };
    payment: { cf_payment_id: string; payment_status: string };
    error_details?: { error_code: string; error_description: string };
}

interface PaymentDroppedData {
    order: { order_id: string };
}

async function handlePaymentSuccess(data: PaymentSuccessData) {
    const { order, payment } = data;

    console.log("Payment successful:", {
        orderId: order.order_id,
        amount: order.order_amount,
        paymentId: payment.cf_payment_id,
        status: payment.payment_status,
        method: payment.payment_method,
    });

    try {
        // Find all orders with this cfOrderId
        const ordersSnapshot = await adminDb
            .collection("orders")
            .where("cfOrderId", "==", order.order_id)
            .get();

        if (ordersSnapshot.empty) {
            console.error("No orders found for cfOrderId:", order.order_id);
            return;
        }

        const batch = adminDb.batch();
        const stockUpdates: { category: string; productId: string; quantity: number }[] = [];

        ordersSnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
            const orderData = doc.data();

            // Update order status
            batch.update(doc.ref, {
                paymentStatus: "paid",
                status: "confirmed",
                cfPaymentId: payment.cf_payment_id,
                paymentMethod: payment.payment_method,
                paymentTime: payment.payment_time,
                paymentAmount: payment.payment_amount,
                updatedAt: new Date(),
            });

            // Collect stock updates
            if (orderData.productCategory && orderData.productId) {
                stockUpdates.push({
                    category: orderData.productCategory,
                    productId: orderData.productId,
                    quantity: orderData.quantity || 1,
                });
            }
        });

        // Commit order updates
        await batch.commit();
        console.log(`Updated ${ordersSnapshot.size} orders to paid/confirmed`);

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
    } catch (error) {
        console.error("Error handling payment success:", error);
        throw error;
    }
}

async function handlePaymentFailed(data: PaymentFailedData) {
    const { order, payment, error_details } = data;

    console.log("Payment failed:", {
        orderId: order.order_id,
        paymentId: payment.cf_payment_id,
        error: error_details,
    });

    try {
        // Find all orders with this cfOrderId
        const ordersSnapshot = await adminDb
            .collection("orders")
            .where("cfOrderId", "==", order.order_id)
            .get();

        if (ordersSnapshot.empty) {
            console.error("No orders found for cfOrderId:", order.order_id);
            return;
        }

        const batch = adminDb.batch();

        ordersSnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
            batch.update(doc.ref, {
                paymentStatus: "failed",
                status: "payment_failed",
                cfPaymentId: payment.cf_payment_id,
                paymentError: error_details || { error_description: "Payment failed" },
                updatedAt: new Date(),
            });
        });

        await batch.commit();
        console.log(`Updated ${ordersSnapshot.size} orders to failed`);
    } catch (error) {
        console.error("Error handling payment failure:", error);
        throw error;
    }
}

async function handlePaymentDropped(data: PaymentDroppedData) {
    const { order } = data;

    console.log("Payment dropped by user:", order.order_id);

    try {
        // Find all orders with this cfOrderId
        const ordersSnapshot = await adminDb
            .collection("orders")
            .where("cfOrderId", "==", order.order_id)
            .get();

        if (ordersSnapshot.empty) {
            console.error("No orders found for cfOrderId:", order.order_id);
            return;
        }

        const batch = adminDb.batch();

        ordersSnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
            batch.update(doc.ref, {
                paymentStatus: "dropped",
                status: "payment_dropped",
                updatedAt: new Date(),
            });
        });

        await batch.commit();
        console.log(`Updated ${ordersSnapshot.size} orders to dropped`);
    } catch (error) {
        console.error("Error handling payment dropped:", error);
        throw error;
    }
}
