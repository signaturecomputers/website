import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

/**
 * Update order status (Admin action)
 * POST /api/orders/update-status
 */
export async function POST(request: NextRequest) {
    try {
        const { orderId, newStatus, trackingNumber, estimatedDelivery, adminNotes } = await request.json();

        if (!orderId || !newStatus) {
            return NextResponse.json(
                { error: "orderId and newStatus are required" },
                { status: 400 }
            );
        }

        // Valid status transitions
        const validStatuses = [
            'pending',
            'confirmed',
            'processing',
            'shipped',
            'out_for_delivery',
            'delivered',
            'cancelled',
            'cancellation_requested',
            'return_requested',
            'return_approved',
            'refund_initiated',
            'refund_processing',
            'refunded',
        ];

        if (!validStatuses.includes(newStatus)) {
            return NextResponse.json(
                { error: `Invalid status: ${newStatus}` },
                { status: 400 }
            );
        }

        // Fetch the order
        const orderDoc = await adminDb.collection("orders").doc(orderId).get();

        if (!orderDoc.exists) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 }
            );
        }

        const orderData = orderDoc.data();
        const oldStatus = orderData?.status;

        // Prepare update data
        const updateData: Record<string, any> = {
            status: newStatus,
            updatedAt: new Date(),
        };

        // Add tracking info if shipping
        if (newStatus === 'shipped' && trackingNumber) {
            updateData.trackingNumber = trackingNumber;
            updateData.shippedAt = new Date();
        }

        if (estimatedDelivery) {
            updateData.estimatedDelivery = estimatedDelivery;
        }

        if (adminNotes) {
            updateData.adminNotes = adminNotes;
        }

        // Mark as delivered
        if (newStatus === 'delivered') {
            updateData.deliveredAt = new Date();
        }

        // Update the order
        await adminDb.collection("orders").doc(orderId).update(updateData);

        // Send email notification for status change
        const emailStatuses = ['processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];

        if (emailStatuses.includes(newStatus) && orderData?.customerEmail) {
            try {
                await fetch(
                    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/email/send`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            type: 'status_change',
                            data: {
                                orderId: orderData.orderId,
                                customerName: orderData.customerName,
                                customerEmail: orderData.customerEmail,
                                customerPhone: orderData.phone || '',
                                productName: orderData.productName,
                                quantity: orderData.quantity || 1,
                                totalAmount: orderData.totalAmount,
                                shippingAddress: orderData.address || '',
                                paymentMethod: orderData.paymentMethod || 'Online',
                                oldStatus,
                                newStatus,
                                trackingNumber: updateData.trackingNumber,
                                estimatedDelivery: updateData.estimatedDelivery,
                            },
                        }),
                    }
                );
                console.log(`Status change email sent for order ${orderData.orderId}: ${oldStatus} -> ${newStatus}`);
            } catch (emailError) {
                console.error("Failed to send status change email:", emailError);
                // Don't fail the request if email fails
            }
        }

        return NextResponse.json({
            success: true,
            message: `Order status updated to ${newStatus}`,
            orderId,
            oldStatus,
            newStatus,
        });
    } catch (error) {
        console.error("Update order status error:", error);
        return NextResponse.json(
            { error: "Failed to update order status" },
            { status: 500 }
        );
    }
}
