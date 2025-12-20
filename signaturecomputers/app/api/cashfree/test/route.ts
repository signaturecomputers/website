import { NextResponse } from "next/server";

// Test endpoint to verify Cashfree credentials
export async function GET() {
    const clientId = process.env.CASHFREE_CLIENT_ID || "";
    const secretKey = process.env.CASHFREE_SECRET_KEY || "";
    const envMode = process.env.CASHFREE_ENV || "SANDBOX";

    // Determine API base URL
    const baseApiUrl = envMode === "PRODUCTION"
        ? "https://api.cashfree.com/pg"
        : "https://sandbox.cashfree.com/pg";

    console.log("Testing Cashfree credentials...");
    console.log("Client ID:", clientId);
    console.log("Secret Key Length:", secretKey.length);
    console.log("Secret Key (first 20 chars):", secretKey.substring(0, 20));
    console.log("Environment:", envMode);
    console.log("API URL:", baseApiUrl);

    // Test a simple order creation
    const testOrder = {
        order_id: `test_${Date.now()}`,
        order_amount: 1.00,
        order_currency: "INR",
        customer_details: {
            customer_id: "test_customer",
            customer_name: "Test User",
            customer_email: "test@example.com",
            customer_phone: "9999999999",
        },
        order_meta: {
            return_url: "http://localhost:3000/return?order_id={order_id}",
        },
    };

    try {
        const response = await fetch(`${baseApiUrl}/orders`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-version": "2025-01-01",
                "x-client-id": clientId,
                "x-client-secret": secretKey,
            },
            body: JSON.stringify(testOrder),
        });

        const data = await response.json();

        console.log("Test Response Status:", response.status);
        console.log("Test Response Data:", JSON.stringify(data, null, 2));

        return NextResponse.json({
            status: response.status,
            success: response.ok,
            clientIdUsed: clientId,
            secretKeyLength: secretKey.length,
            secretKeyFormat: secretKey.startsWith("cfsk_") ? "Valid format" : `Unexpected format: starts with "${secretKey.substring(0, 10)}"`,
            environment: envMode,
            apiUrl: baseApiUrl,
            response: data,
        });
    } catch (error) {
        console.error("Test Error:", error);
        return NextResponse.json({
            error: "Test failed",
            details: String(error),
        }, { status: 500 });
    }
}
