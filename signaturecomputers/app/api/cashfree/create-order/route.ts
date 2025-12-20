import { NextRequest, NextResponse } from "next/server";

// Get credentials (trim whitespace)
const clientId = process.env.CASHFREE_CLIENT_ID?.trim() || "";
const secretKey = process.env.CASHFREE_SECRET_KEY?.trim() || "";
const envMode = process.env.CASHFREE_ENV?.trim();

// Determine API base URL
const baseApiUrl = envMode === "PRODUCTION"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";

// Log configuration on startup
console.log("Cashfree Config:", {
    environment: envMode === "PRODUCTION" ? "PRODUCTION" : "SANDBOX",
    apiUrl: baseApiUrl,
    clientId: clientId.substring(0, 12) + "...",
    secretKeyLength: secretKey.length,
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Check credentials are set
        if (!clientId || !secretKey) {
            console.error("Cashfree credentials not configured");
            return NextResponse.json(
                { error: "Payment gateway not configured" },
                { status: 500 }
            );
        }

        // Validate required fields
        if (!body.amount || !body.customer_id || !body.email || !body.phone) {
            return NextResponse.json(
                { error: "Missing required fields: amount, customer_id, email, phone" },
                { status: 400 }
            );
        }

        // Validate amount is a positive number
        if (typeof body.amount !== "number" || body.amount <= 0) {
            return NextResponse.json(
                { error: "Amount must be a positive number" },
                { status: 400 }
            );
        }

        // Validate phone number (Indian format - 10 digits starting with 6-9)
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(body.phone)) {
            return NextResponse.json(
                { error: "Invalid phone number format. Must be 10 digits starting with 6-9" },
                { status: 400 }
            );
        }

        const returnBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const orderId = body.order_id || `order_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

        // Create order request body
        const orderRequest = {
            order_id: orderId,
            order_amount: body.amount,
            order_currency: "INR",
            customer_details: {
                customer_id: body.customer_id,
                customer_name: body.customer_name || "Customer",
                customer_email: body.email,
                customer_phone: body.phone,
            },
            order_meta: {
                return_url: `${returnBaseUrl}/return?order_id={order_id}`,
            },
        };

        console.log("Creating Cashfree order via REST API:", {
            order_id: orderId,
            amount: body.amount,
        });

        // Direct REST API call
        const response = await fetch(`${baseApiUrl}/orders`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-version": "2025-01-01",
                "x-client-id": clientId,
                "x-client-secret": secretKey,
            },
            body: JSON.stringify(orderRequest),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Cashfree API Error:", {
                status: response.status,
                data: data,
            });
            return NextResponse.json(
                { error: "Payment gateway error", details: data },
                { status: response.status }
            );
        }

        console.log("Cashfree order created successfully:", data.order_id);

        return NextResponse.json({
            order_id: data.order_id,
            payment_session_id: data.payment_session_id,
            order_status: data.order_status,
        });
    } catch (error: unknown) {
        console.error("Cashfree order creation error:", error);

        return NextResponse.json(
            { error: "Failed to create payment order" },
            { status: 500 }
        );
    }
}
