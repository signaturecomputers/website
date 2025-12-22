import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

// Configurable return window in days
const RETURN_WINDOW_DAYS = 7;

export const RETURN_REASONS = [
    "Product damaged on arrival",
    "Product not as described",
    "Wrong product delivered",
    "Product not working",
    "Quality not as expected",
    "Missing parts/accessories",
    "Other",
];

interface ReturnRequest {
    orderId: string;
    customerId: string;
    reason: string;
    comments?: string;
    images?: string[];  // Product condition images
}

/**
 * Request product return
 * POST /api/orders/return
 */
export async function POST(request: NextRequest) {
    try {
        const body: ReturnRequest = await request.json();

        if (!body.orderId || !body.customerId || !body.reason) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Fetch order
        const orderDoc = await adminDb.collection("orders").doc(body.orderId).get();

        if (!orderDoc.exists) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 }
            );
        }

        const order = orderDoc.data();

        // Verify customer owns this order
        if (order?.customerId !== body.customerId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 403 }
            );
        }

        // Check if order is delivered
        if (order?.status !== 'delivered') {
            return NextResponse.json(
                {
                    error: "Return not available",
                    reason: order?.status === 'shipped' || order?.status === 'out_for_delivery'
                        ? "Please wait until order is delivered to request a return"
                        : "Only delivered orders can be returned"
                },
                { status: 400 }
            );
        }

        // Check return window
        let deliveredDate: Date;
        if (order?.deliveredAt?.toDate) {
            deliveredDate = order.deliveredAt.toDate();
        } else if (order?.deliveredAt) {
            deliveredDate = new Date(order.deliveredAt);
        } else {
            // If no delivered date, use updated date as fallback
            deliveredDate = order?.updatedAt?.toDate?.() || new Date();
        }

        const daysSinceDelivery = Math.floor(
            (Date.now() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceDelivery > RETURN_WINDOW_DAYS) {
            return NextResponse.json(
                {
                    error: "Return window expired",
                    reason: `Returns must be requested within ${RETURN_WINDOW_DAYS} days of delivery. Your order was delivered ${daysSinceDelivery} days ago.`
                },
                { status: 400 }
            );
        }

        // Check if return already requested
        if (order?.status === 'return_requested' || order?.returnRequestId) {
            return NextResponse.json(
                { error: "Return has already been requested for this order" },
                { status: 400 }
            );
        }

        // Create return request
        const returnId = `RET-${Date.now()}`;
        const returnData = {
            id: returnId,
            orderId: body.orderId,
            customerId: body.customerId,
            customerName: order?.customerName,
            customerEmail: order?.customerEmail,
            customerPhone: order?.phone,
            productName: order?.productName,
            productId: order?.productId,
            productCategory: order?.productCategory,
            orderAmount: order?.totalAmount,
            reason: body.reason,
            comments: body.comments || "",
            images: body.images || [],
            status: 'pending',  // pending, approved, rejected, pickup_scheduled, picked_up, refund_initiated
            deliveredAt: deliveredDate,
            requestedAt: new Date(),
            processedAt: null,
            processedBy: null,
            adminNotes: null,
            pickupDate: null,
            pickupAddress: order?.address || '',
        };

        await adminDb.collection("return_requests").doc(returnId).set(returnData);

        // Update order status
        await adminDb.collection("orders").doc(body.orderId).update({
            status: 'return_requested',
            returnRequestId: returnId,
            returnReason: body.reason,
            updatedAt: new Date(),
        });

        // Send email notification to admin
        try {
            await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/email/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'return_request',
                    data: {
                        order: {
                            orderId: order?.orderId,
                            customerName: order?.customerName,
                            customerEmail: order?.customerEmail,
                            customerPhone: order?.phone || '',
                            productName: order?.productName,
                            quantity: order?.quantity || 1,
                            totalAmount: order?.totalAmount,
                            shippingAddress: order?.address || '',
                            paymentMethod: order?.paymentMethod || 'Online',
                        },
                        reason: body.reason,
                    },
                }),
            });
        } catch (emailError) {
            console.error("Failed to send return request email:", emailError);
        }

        return NextResponse.json({
            success: true,
            returnId,
            message: "Return request submitted successfully",
            daysInWindow: RETURN_WINDOW_DAYS - daysSinceDelivery,
            data: returnData,
        });
    } catch (error) {
        console.error("Return request error:", error);
        return NextResponse.json(
            { error: "Failed to process return request" },
            { status: 500 }
        );
    }
}

/**
 * Get return request status
 * GET /api/orders/return?returnId=xxx
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const returnId = searchParams.get("returnId");
        const orderId = searchParams.get("orderId");

        if (!returnId && !orderId) {
            return NextResponse.json(
                { error: "returnId or orderId is required" },
                { status: 400 }
            );
        }

        let returnDoc;

        if (returnId) {
            returnDoc = await adminDb.collection("return_requests").doc(returnId).get();
        } else {
            const snapshot = await adminDb
                .collection("return_requests")
                .where("orderId", "==", orderId)
                .limit(1)
                .get();

            if (!snapshot.empty) {
                returnDoc = snapshot.docs[0];
            }
        }

        if (!returnDoc?.exists) {
            return NextResponse.json(
                { error: "Return request not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: returnDoc.data(),
        });
    } catch (error) {
        console.error("Get return request error:", error);
        return NextResponse.json(
            { error: "Failed to fetch return request" },
            { status: 500 }
        );
    }
}
