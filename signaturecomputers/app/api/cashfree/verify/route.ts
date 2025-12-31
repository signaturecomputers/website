import { NextRequest, NextResponse } from "next/server";

// Get credentials
const clientId = process.env.CASHFREE_CLIENT_ID?.trim() || "";
const secretKey = process.env.CASHFREE_SECRET_KEY?.trim() || "";
const envMode = process.env.CASHFREE_ENV?.trim();

// Determine API base URL
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

        if (!clientId || !secretKey) {
            return NextResponse.json(
                { error: "Payment gateway not configured" },
                { status: 500 }
            );
        }

        // Fetch order status from Cashfree via REST API
        const response = await fetch(`${baseApiUrl}/orders/${order_id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-api-version": "2025-01-01",
                "x-client-id": clientId,
                "x-client-secret": secretKey,
            },
        });

        const orderData = await response.json();

        if (!response.ok) {
            console.error("Cashfree verify error:", orderData);
            return NextResponse.json(
                { error: "Failed to verify order", details: orderData },
                { status: response.status }
            );
        }

        // Check for payment attempts if order is ACTIVE (to detect failure)
        let failureDetails = null;
        if (orderData.order_status === "ACTIVE") {
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
                    if (Array.isArray(paymentsData) && paymentsData.length > 0) {
                        // Sort by payment_time desc if needed, but usually recent is last or first?
                        // Cashfree usually returns list. Let's assume order is somewhat chronological or check times.
                        // Actually, let's just look for ANY failed/dropped if there is no success.

                        // Find latest payment (basic sort)
                        const latestPayment = paymentsData.sort((a: any, b: any) =>
                            new Date(b.payment_time || 0).getTime() - new Date(a.payment_time || 0).getTime()
                        )[0];

                        if (latestPayment) {
                            const pStatus = latestPayment.payment_status;
                            if (["FAILED", "USER_DROPPED", "CANCELLED", "VOID"].includes(pStatus)) {
                                console.log("Found failed payment attempt for ACTIVE order:", pStatus);
                                orderData.order_status = "PAYMENT_FAILED"; // Override status for UI
                                failureDetails = latestPayment.error_details || { error_description: "Payment failed" };
                            }
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to fetch payments in verify:", err);
            }
        }

        return NextResponse.json({
            order_id: orderData.order_id,
            order_status: orderData.order_status,
            order_amount: orderData.order_amount,
            payment_session_id: orderData.payment_session_id,
            customer_details: orderData.customer_details,
            error_details: failureDetails
        });
    } catch (error: unknown) {
        console.error("Order verification error:", error);

        return NextResponse.json(
            { error: "Failed to verify order" },
            { status: 500 }
        );
    }
}
