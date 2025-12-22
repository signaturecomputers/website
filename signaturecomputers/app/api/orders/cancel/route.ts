import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export const CANCELLATION_REASONS = [
    "Changed my mind",
    "Found a better price elsewhere",
    "Ordered by mistake",
    "Product no longer needed",
    "Delivery time too long",
    "Other",
];

export const RETURN_REASONS = [
    "Product damaged on arrival",
    "Product not as described",
    "Wrong product delivered",
    "Product not working",
    "Quality not as expected",
    "Missing parts/accessories",
    "Other",
];

// Configurable return window in days
export const RETURN_WINDOW_DAYS = 7;

interface CancellationRequest {
    orderId: string;
    customerId: string;
    reason: string;
    comments?: string;
}

interface ReturnRequest {
    orderId: string;
    customerId: string;
    reason: string;
    comments?: string;
    images?: string[];  // Product condition images
}

/**
 * Request order cancellation
 * POST /api/orders/cancel
 */
export async function POST(request: NextRequest) {
    try {
        const body: CancellationRequest = await request.json();

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

        // Check if order can be cancelled (not shipped, delivered, or already cancelled)
        const nonCancellableStatuses = [
            'shipped', 'out_for_delivery', 'delivered',
            'cancelled', 'cancellation_requested', 'refunded'
        ];

        if (nonCancellableStatuses.includes(order?.status)) {
            return NextResponse.json(
                {
                    error: "Order cannot be cancelled",
                    reason: order?.status === 'shipped' || order?.status === 'out_for_delivery'
                        ? "Order has already been shipped"
                        : order?.status === 'delivered'
                            ? "Order has been delivered. Please request a return instead."
                            : "Order is already cancelled or refunded"
                },
                { status: 400 }
            );
        }

        // Create cancellation request
        const cancellationId = `CAN-${Date.now()}`;
        const cancellationData = {
            id: cancellationId,
            orderId: body.orderId,
            customerId: body.customerId,
            customerName: order?.customerName,
            customerEmail: order?.customerEmail,
            productName: order?.productName,
            orderAmount: order?.totalAmount,
            reason: body.reason,
            comments: body.comments || "",
            status: 'pending',  // pending, approved, rejected
            requestedAt: new Date(),
            processedAt: null,
            processedBy: null,
            adminNotes: null,
        };

        await adminDb.collection("cancellation_requests").doc(cancellationId).set(cancellationData);

        // Update order status
        await adminDb.collection("orders").doc(body.orderId).update({
            status: 'cancellation_requested',
            cancellationRequested: true,
            cancellationRequestedAt: new Date(),
            cancellationRequestId: cancellationId,
            cancellationReason: body.reason,
            updatedAt: new Date(),
        });

        // Send email notification to admin
        try {
            await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/email/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'cancellation_request',
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
            console.error("Failed to send cancellation request email:", emailError);
        }

        return NextResponse.json({
            success: true,
            cancellationId,
            message: "Cancellation request submitted successfully",
            data: cancellationData,
        });
    } catch (error) {
        console.error("Cancellation request error:", error);
        return NextResponse.json(
            { error: "Failed to process cancellation request" },
            { status: 500 }
        );
    }
}
