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

        console.log("========================================");
        console.log("🔔 CASHFREE WEBHOOK RECEIVED");
        console.log("Type:", type);
        console.log("Data:", JSON.stringify(data, null, 2));
        console.log("========================================");

        // Store webhook event in Firestore for tracking
        try {
            await adminDb.collection('webhook_logs').add({
                type,
                data,
                receivedAt: new Date(),
                processed: false,
                rawPayload: rawBody,
            });
            console.log("Webhook logged to Firestore");
        } catch (logError) {
            console.error("Failed to log webhook:", logError);
        }

        // Handle different webhook event types
        switch (type) {
            case "PAYMENT_SUCCESS_WEBHOOK":
                console.log("💰 Processing PAYMENT SUCCESS");
                await handlePaymentSuccess(data);
                break;
            case "PAYMENT_FAILED_WEBHOOK":
                console.log("❌ Processing PAYMENT FAILED");
                await handlePaymentFailed(data);
                break;
            case "PAYMENT_USER_DROPPED_WEBHOOK":
                console.log("👋 Processing PAYMENT DROPPED");
                await handlePaymentDropped(data);
                break;
            case "REFUND_STATUS_WEBHOOK":
            case "REFUND_PROCESSED_WEBHOOK":
                console.log("💸 Processing REFUND STATUS");
                await handleRefundStatus(data);
                break;
            default:
                console.log("⚠️ Unhandled webhook type:", type);
        }

        // Update webhook log as processed
        try {
            const recentLogs = await adminDb.collection('webhook_logs')
                .where('type', '==', type)
                .orderBy('receivedAt', 'desc')
                .limit(1)
                .get();
            if (!recentLogs.empty) {
                await recentLogs.docs[0].ref.update({ processed: true, processedAt: new Date() });
            }
        } catch (updateError) {
            console.error("Failed to update webhook log:", updateError);
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
        const ordersToNotify: { docId: string; data: DocumentData }[] = [];

        ordersSnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
            const orderData = doc.data();

            // Update order status
            batch.update(doc.ref, {
                paymentStatus: "paid",
                orderStatus: "confirmed",  // New field
                status: "confirmed",        // Legacy field for compatibility
                cfPaymentId: payment.cf_payment_id,
                paymentMethod: payment.payment_method,
                paymentTime: payment.payment_time,
                paymentAmount: payment.payment_amount,
                updatedAt: new Date(),
                timeline: adminDb.FieldValue.arrayUnion({
                    timestamp: new Date(),
                    event: "Payment Successful",
                    description: `Payment of ₹${payment.payment_amount} received via ${payment.payment_method?.toString() || 'online'}`,
                    actor: "system"
                })
            });

            // Collect stock updates
            if (orderData.productCategory && orderData.productId) {
                stockUpdates.push({
                    category: orderData.productCategory,
                    productId: orderData.productId,
                    quantity: orderData.quantity || 1,
                });
            }

            // Collect orders for email notifications
            ordersToNotify.push({ docId: doc.id, data: orderData });
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

        // Generate invoice and send confirmation emails for each order
        for (const orderInfo of ordersToNotify) {
            try {
                // Generate invoice
                const invoiceResponse = await fetch(
                    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/invoice/generate`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ orderId: orderInfo.docId }),
                    }
                );

                const invoiceData = await invoiceResponse.json();
                console.log("Invoice generated:", invoiceData.invoiceNumber);

                // Send order confirmation email
                const emailResponse = await fetch(
                    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/email/send`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            type: 'order_confirmation',
                            data: {
                                orderId: orderInfo.data.orderId,
                                customerName: orderInfo.data.customerName,
                                customerEmail: orderInfo.data.customerEmail,
                                customerPhone: orderInfo.data.phone || '',
                                productName: orderInfo.data.productName,
                                quantity: orderInfo.data.quantity || 1,
                                totalAmount: orderInfo.data.totalAmount,
                                shippingAddress: orderInfo.data.address || '',
                                paymentMethod: 'Online Payment (Cashfree)',
                                invoiceNumber: invoiceData.invoiceNumber,
                            },
                        }),
                    }
                );

                if (emailResponse.ok) {
                    console.log("Order confirmation email sent for:", orderInfo.data.orderId);
                }
            } catch (notifyError) {
                console.error("Error sending notifications:", notifyError);
                // Don't throw - payment was successful, email is secondary
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

interface RefundStatusData {
    refund: {
        cf_refund_id: string;
        refund_id: string;
        order_id: string;
        refund_amount: number;
        refund_status: string; // 'SUCCESS', 'PENDING', 'CANCELLED'
        refund_arn?: string;
        processed_at?: string;
    };
}

async function handleRefundStatus(data: RefundStatusData) {
    const { refund } = data;

    console.log("Refund status update:", refund.cf_refund_id, "Status:", refund.refund_status);

    try {
        // Find all orders with this cfOrderId
        const ordersSnapshot = await adminDb
            .collection("orders")
            .where("cfOrderId", "==", refund.order_id)
            .get();

        if (ordersSnapshot.empty) {
            console.error("No orders found for refund:", refund.order_id);
            return;
        }

        const batch = adminDb.batch();
        const isSuccess = refund.refund_status === 'SUCCESS';
        const isCancelled = refund.refund_status === 'CANCELLED';

        ordersSnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
            const isSuccess = refund.refund_status === 'SUCCESS';
            const isPending = refund.refund_status === 'PENDING' || refund.refund_status === 'ONHOLD';
            const isCancelled = refund.refund_status === 'CANCELLED';

            // Map Cashfree status to our RefundStatus enum
            let refundStatusValue = 'processing';
            if (isSuccess) refundStatusValue = 'completed';
            else if (isPending) refundStatusValue = 'processing';
            else if (isCancelled) refundStatusValue = 'failed';

            const updateData: Record<string, unknown> = {
                cfRefundId: refund.cf_refund_id,
                refundStatus: refundStatusValue,  // New enum value
                refundArn: refund.refund_arn || null,
                updatedAt: new Date(),
                // Order status stays as 'cancelled' - we don't change it
                // The refundStatus field tracks the refund separately
            };

            if (isSuccess) {
                updateData.refundCompletedAt = refund.processed_at ? new Date(refund.processed_at) : new Date();
            }

            // Add timeline event
            updateData.timeline = adminDb.FieldValue.arrayUnion({
                timestamp: new Date(),
                event: isSuccess ? 'Refund Completed' : (isCancelled ? 'Refund Failed' : 'Refund Processing'),
                description: isSuccess
                    ? `Refund of ₹${refund.refund_amount} completed. ARN: ${refund.refund_arn || 'N/A'}`
                    : (isCancelled
                        ? `Refund failed: ${refund.refund_status}`
                        : `Refund is being processed: ${refund.refund_status}`),
                actor: 'system'
            });

            batch.update(doc.ref, updateData);
        });

        // Also update the refunds collection
        const refundsSnapshot = await adminDb
            .collection("refunds")
            .where("cfRefundId", "==", refund.cf_refund_id)
            .get();

        refundsSnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
            batch.update(doc.ref, {
                status: isSuccess ? 'completed' : (isCancelled ? 'failed' : refund.refund_status.toLowerCase()),
                completedAt: isSuccess ? (refund.processed_at ? new Date(refund.processed_at) : new Date()) : null,
                refundArn: refund.refund_arn || null,
                updatedAt: new Date(),
            });
        });

        // Update cancellation_requests or return_requests if they exist
        for (const collectionName of ['cancellation_requests', 'return_requests']) {
            const requestsSnapshot = await adminDb
                .collection(collectionName)
                .where('refundId', '==', refund.refund_id)
                .get();

            requestsSnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
                batch.update(doc.ref, {
                    refundStatus: isSuccess ? 'completed' : (isCancelled ? 'failed' : refund.refund_status.toLowerCase()),
                    status: isSuccess ? 'refund_completed' : (isCancelled ? 'refund_failed' : 'refund_processing'),
                    updatedAt: new Date(),
                });
            });
        }

        await batch.commit();
        console.log(`Refund status updated: ${refund.cf_refund_id} -> ${refund.refund_status}`);

        // If refund is successful, send email notification
        if (isSuccess) {
            try {
                // Get order details for email
                const orderDoc = ordersSnapshot.docs[0];
                const orderData = orderDoc.data();

                const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
                await fetch(`${appUrl}/api/email/send`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'refund',
                        data: {
                            orderId: orderData.orderId,
                            customerName: orderData.customerName,
                            customerEmail: orderData.customerEmail,
                            refundAmount: refund.refund_amount,
                            refundStatus: 'completed',
                            refundId: refund.cf_refund_id,
                        },
                    }),
                });
            } catch (emailError) {
                console.error('Failed to send refund completion email:', emailError);
            }
        }
    } catch (error) {
        console.error("Error handling refund status:", error);
        throw error;
    }
}
