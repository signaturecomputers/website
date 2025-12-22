import { NextRequest, NextResponse } from "next/server";

// Cashfree API endpoint to check refund status
const CASHFREE_ENV = process.env.CASHFREE_ENV || 'TEST';
const CASHFREE_API_BASE = CASHFREE_ENV === 'PROD'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';

export async function POST(request: NextRequest) {
    try {
        const { cfOrderId, refundId } = await request.json();

        if (!cfOrderId) {
            return NextResponse.json({ error: "cfOrderId is required" }, { status: 400 });
        }

        const clientId = process.env.CASHFREE_CLIENT_ID;
        const secretKey = process.env.CASHFREE_SECRET_KEY;

        if (!clientId || !secretKey) {
            console.error("Cashfree credentials not configured");
            return NextResponse.json(
                { error: "Payment gateway not configured" },
                { status: 500 }
            );
        }

        // If we have a specific refund ID, check that refund
        // Otherwise, get all refunds for the order
        let url = `${CASHFREE_API_BASE}/orders/${cfOrderId}/refunds`;
        if (refundId) {
            url = `${CASHFREE_API_BASE}/orders/${cfOrderId}/refunds/${refundId}`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-client-id': clientId,
                'x-client-secret': secretKey,
                'x-api-version': '2025-01-01',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Cashfree refund check error:", data);
            return NextResponse.json(
                { error: data.message || "Failed to check refund status" },
                { status: response.status }
            );
        }

        // If checking specific refund, return that
        // If getting all refunds, find the latest/relevant one
        let refundData = data;
        if (Array.isArray(data)) {
            // Get the most recent refund (or first successful one)
            refundData = data.find((r: any) => r.refund_status === 'SUCCESS') || data[0];
        }

        console.log("Refund status from Cashfree:", refundData);

        return NextResponse.json({
            success: true,
            refund: {
                cfRefundId: refundData?.cf_refund_id,
                refundId: refundData?.refund_id,
                amount: refundData?.refund_amount,
                status: refundData?.refund_status, // SUCCESS, PENDING, ONHOLD, CANCELLED
                arn: refundData?.refund_arn,
                processedAt: refundData?.processed_at,
                createdAt: refundData?.created_at,
            },
            raw: refundData,
        });
    } catch (error) {
        console.error("Error checking refund status:", error);
        return NextResponse.json(
            { error: "Failed to check refund status" },
            { status: 500 }
        );
    }
}
