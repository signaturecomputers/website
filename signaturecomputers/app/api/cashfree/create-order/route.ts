import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

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

interface OrderItem {
    productId: string;
    productName: string;
    productImage: string;
    productCategory: string;
    partNumber: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    windowsInstallation?: boolean;
    windowsInstallationPrice?: number;
    carePack?: {
        title: string;
        duration: string;
        price: number;
        partNumber: string;
    } | null;
}

interface CreateOrderRequest {
    amount: number;
    customer_id: string;
    customer_name: string;
    email: string;
    phone: string;
    order_id?: string;
    orderItems: OrderItem[];
    shippingAddress: {
        addressLine1: string;
        city: string;
        state: string;
        pincode: string;
    };
    fullAddress: string;
}

export async function POST(request: NextRequest) {
    try {
        const body: CreateOrderRequest = await request.json();

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

        // Validate order items
        if (!body.orderItems || body.orderItems.length === 0) {
            return NextResponse.json(
                { error: "Order items are required" },
                { status: 400 }
            );
        }

        const returnBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const cfOrderId = body.order_id || `CF-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

        // Create order request body for Cashfree
        const orderRequest = {
            order_id: cfOrderId,
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
            order_id: cfOrderId,
            amount: body.amount,
        });

        // Direct REST API call to Cashfree
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

        // Store pending order data in Firestore (server-side)
        // This will be converted to actual orders only when payment succeeds
        const pendingOrderDoc = {
            cfOrderId,
            orderItems: body.orderItems,
            customerId: body.customer_id,
            customerEmail: body.email,
            customerName: body.customer_name,
            phone: body.phone,
            fullAddress: body.fullAddress,
            shippingAddress: body.shippingAddress,
            totalAmount: body.amount,
            status: "pending_payment",
            createdAt: FieldValue.serverTimestamp(),
            expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes expiry
        };

        await adminDb.collection("pending_orders").doc(cfOrderId).set(pendingOrderDoc);
        console.log("Pending order stored in Firestore:", cfOrderId);

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
