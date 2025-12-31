import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { adminDb } from "@/lib/firebase-admin";
import { QueryDocumentSnapshot, DocumentData, Transaction, FieldValue, DocumentSnapshot } from "firebase-admin/firestore";

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
        const pendingOrderRef = adminDb.collection("pending_orders").doc(order.order_id);
        const stockUpdates: { category: string; productId: string; quantity: number }[] = [];

        // 1. Try to process via transaction (Primary flow: create from pending)
        try {
            const transactionResult = await adminDb.runTransaction(async (t: Transaction) => {
                const pendingDoc = (await t.get(pendingOrderRef)) as unknown as DocumentSnapshot;

                if (!pendingDoc.exists) {
                    return { status: "ALREADY_PROCESSED_OR_MISSING" };
                }

                const pendingOrder = pendingDoc.data()!;
                const createdOrderIds: string[] = [];

                // Create orders
                for (const item of pendingOrder.orderItems) {
                    const now = new Date();
                    const dateStr = now.getFullYear().toString() +
                        (now.getMonth() + 1).toString().padStart(2, '0') +
                        now.getDate().toString().padStart(2, '0');
                    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
                    const orderId = `SC-${dateStr}-${randomPart}`;
                    const newOrderRef = adminDb.collection("orders").doc();

                    const orderDocument: Record<string, any> = {
                        orderId,
                        cfOrderId: order.order_id,
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
                        cfPaymentId: payment.cf_payment_id,
                        paymentAmount: payment.payment_amount,
                        paymentTime: payment.payment_time,
                        createdAt: FieldValue.serverTimestamp(),
                        updatedAt: FieldValue.serverTimestamp(),
                        timeline: [{
                            timestamp: new Date(),
                            event: "Order Created",
                            description: "Payment successful (Webhook). Order placed, awaiting admin confirmation.",
                            actor: "system"
                        }]
                    };

                    if (item.windowsInstallation && item.windowsInstallationPrice) {
                        orderDocument.windowsInstallationPrice = item.windowsInstallationPrice;
                    }

                    t.set(newOrderRef, orderDocument);
                    createdOrderIds.push(orderId);

                    // Add to stock updates list (to be processed after transaction)
                    stockUpdates.push({
                        category: item.productCategory,
                        productId: item.productId,
                        quantity: item.quantity,
                    });
                }

                // Delete pending order (Atomic Lock)
                t.delete(pendingOrderRef);

                return { status: "CREATED", createdOrderIds };
            });

            if (transactionResult.status === "CREATED") {
                console.log(`Created ${transactionResult.createdOrderIds?.length} orders from webhook via transaction`);
            } else {
                console.log("Pending order not found in webhook transaction - likely processed by return page");
            }

        } catch (transactionError) {
            console.log("Transaction likely aborted or failed (could be contention):", transactionError);
            // We continue to check if orders exist, just in case.
        }

        // 2. Check if orders exist (Secondary/Fallback flow: update existing)
        // This handles cases where:
        // A) Transaction failed/missed but orders exist (already processed)
        // B) Orders were created manually or by legacy flow
        const existingOrdersSnapshot = await adminDb
            .collection("orders")
            .where("cfOrderId", "==", order.order_id)
            .get();

        if (!existingOrdersSnapshot.empty) {
            const batch = adminDb.batch();
            let updates = 0;

            existingOrdersSnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
                const orderData = doc.data();
                if (orderData.paymentStatus !== "paid") {
                    batch.update(doc.ref, {
                        paymentStatus: "paid",
                        orderStatus: "placed",
                        status: "placed",
                        cfPaymentId: payment.cf_payment_id,
                        paymentMethod: payment.payment_method,
                        paymentTime: payment.payment_time,
                        paymentAmount: payment.payment_amount,
                        updatedAt: new Date(),
                        timeline: FieldValue.arrayUnion({
                            timestamp: new Date(),
                            event: "Payment Successful",
                            description: `Payment of ₹${payment.payment_amount} received. Awaiting order confirmation.`,
                            actor: "system"
                        })
                    });
                    updates++;

                    // Also add to stock updates if this was a legacy update
                    if (orderData.productCategory && orderData.productId) {
                        stockUpdates.push({
                            category: orderData.productCategory,
                            productId: orderData.productId,
                            quantity: orderData.quantity || 1,
                        });
                    }
                }
            });

            if (updates > 0) {
                await batch.commit();
                console.log(`Updated ${updates} existing orders to paid`);
            }
        }

        // 3. Deduct stock (Idempotent-ish: only if we have collected updates)
        // Note: We might deduct twice if we are not careful, but stockUpdates is local to this function execution.
        // If transaction ran, we have updates. If fallback ran, we added updates.
        // Realistically, if transaction ran, fallback won't find "unpaid" orders.
        // If transaction missed (status=MISSING), fallback usually finds "paid" orders (so updates=0).
        // So this is safe.
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
            // With the new payment-gated flow, no orders exist if payment failed
            // Clean up the pending order if it exists
            try {
                await adminDb.collection("pending_orders").doc(order.order_id).delete();
                console.log("Deleted pending order due to payment failure:", order.order_id);
            } catch (e) {
                // Ignore if doesn't exist
            }
            console.log("No orders to cancel for cfOrderId:", order.order_id);
            return;
        }

        const batch = adminDb.batch();

        ordersSnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
            // AUTO-CANCEL order on payment failure
            batch.update(doc.ref, {
                paymentStatus: "failed",
                orderStatus: "cancelled",  // Auto-cancel on payment failure
                status: "cancelled",       // Legacy field
                cancellationReason: "Order cancelled due to payment failure.",
                cancelledAt: new Date(),
                cancelledBy: "system",
                cfPaymentId: payment.cf_payment_id,
                paymentError: error_details || { error_description: "Payment failed" },
                updatedAt: new Date(),
                timeline: FieldValue.arrayUnion({
                    timestamp: new Date(),
                    event: "Order Cancelled",
                    description: "Order automatically cancelled due to payment failure.",
                    actor: "system"
                })
            });
        });

        await batch.commit();
        console.log(`Updated ${ordersSnapshot.size} orders to cancelled (payment failed)`);
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
            // With the new payment-gated flow, no orders exist if payment was dropped
            // Clean up the pending order if it exists
            try {
                await adminDb.collection("pending_orders").doc(order.order_id).delete();
                console.log("Deleted pending order due to payment dropped:", order.order_id);
            } catch (e) {
                // Ignore if doesn't exist
            }
            console.log("No orders to update for cfOrderId:", order.order_id);
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
        const isPending = refund.refund_status === 'PENDING' || refund.refund_status === 'ONHOLD';
        const isCancelled = refund.refund_status === 'CANCELLED';

        ordersSnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
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
            updateData.timeline = FieldValue.arrayUnion({
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
