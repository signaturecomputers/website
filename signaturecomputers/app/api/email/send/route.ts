import { NextRequest, NextResponse } from "next/server";
import {
    sendOrderConfirmation,
    sendAdminNewOrderNotification,
    sendOrderStatusChange,
    sendRefundNotification,
    sendCancellationRequestToAdmin,
    sendReturnRequestToAdmin,
    OrderDetails,
    StatusChangeDetails,
    RefundDetails,
} from "@/lib/email";

/**
 * Send transactional emails
 * POST /api/email/send
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { type, data } = body;

        if (!type || !data) {
            return NextResponse.json(
                { error: "Missing type or data" },
                { status: 400 }
            );
        }

        let success = false;

        switch (type) {
            case "order_confirmation":
                success = await sendOrderConfirmation(data as OrderDetails);
                // Also send admin notification
                await sendAdminNewOrderNotification(data as OrderDetails);
                break;

            case "admin_new_order":
                success = await sendAdminNewOrderNotification(data as OrderDetails);
                break;

            case "status_change":
                success = await sendOrderStatusChange(data as StatusChangeDetails);
                break;

            case "refund":
                success = await sendRefundNotification(data as RefundDetails);
                break;

            case "cancellation_request":
                success = await sendCancellationRequestToAdmin(
                    data.order as OrderDetails,
                    data.reason as string
                );
                break;

            case "return_request":
                success = await sendReturnRequestToAdmin(
                    data.order as OrderDetails,
                    data.reason as string
                );
                break;

            default:
                return NextResponse.json(
                    { error: `Unknown email type: ${type}` },
                    { status: 400 }
                );
        }

        if (success) {
            return NextResponse.json({ success: true, message: "Email sent" });
        } else {
            return NextResponse.json(
                { success: false, error: "Failed to send email" },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("Email API error:", error);
        return NextResponse.json(
            { error: "Failed to process email request" },
            { status: 500 }
        );
    }
}
