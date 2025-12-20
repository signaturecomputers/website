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

        return NextResponse.json({
            order_id: orderData.order_id,
            order_status: orderData.order_status,
            order_amount: orderData.order_amount,
            payment_session_id: orderData.payment_session_id,
            customer_details: orderData.customer_details,
        });
    } catch (error: unknown) {
        console.error("Order verification error:", error);

        return NextResponse.json(
            { error: "Failed to verify order" },
            { status: 500 }
        );
    }
}
