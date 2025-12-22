import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

// Cashfree API configuration
const clientId = process.env.CASHFREE_CLIENT_ID?.trim() || "";
const secretKey = process.env.CASHFREE_SECRET_KEY?.trim() || "";
const envMode = process.env.CASHFREE_ENV?.trim();

const baseApiUrl = envMode === "PRODUCTION"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";

interface RefundRequest {
    orderId: string;        // Firestore order document ID
    cfOrderId: string;      // Cashfree order ID
    refundAmount: number;
    refundType: 'full' | 'partial';
    reason: string;
    initiatedBy: string;    // Admin user ID
}

interface RefundData {
    orderId: string;
    cfOrderId: string;
    cfRefundId?: string;
    refundAmount: number;
    refundType: 'full' | 'partial';
    reason: string;
    status: 'initiated' | 'processing' | 'completed' | 'failed';
    initiatedBy: string;
    initiatedAt: Date;
    completedAt?: Date;
    cashfreeResponse?: any;
    errorMessage?: string;
}

/**
 * Initiate refund via Cashfree
 * POST /api/cashfree/refund
 */
export async function POST(request: NextRequest) {
    try {
        const body: RefundRequest = await request.json();

        // Validate required fields
        if (!body.orderId || !body.cfOrderId || !body.refundAmount) {
            return NextResponse.json(
                { error: "Missing required fields: orderId, cfOrderId, refundAmount" },
                { status: 400 }
            );
        }

        // Validate credentials
        if (!clientId || !secretKey) {
            console.error("Cashfree credentials not configured");
            return NextResponse.json(
                { error: "Payment gateway not configured" },
                { status: 500 }
            );
        }

        // Fetch the order to verify it exists and is eligible for refund
        const orderDoc = await adminDb.collection("orders").doc(body.orderId).get();

        if (!orderDoc.exists) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 }
            );
        }

        const orderData = orderDoc.data();

        // Check if order is paid
        if (orderData?.paymentStatus !== 'paid' && orderData?.paymentMethod !== 'COD') {
            return NextResponse.json(
                { error: "Order is not eligible for refund - payment not completed" },
                { status: 400 }
            );
        }

        // Check if refund already exists for this order
        const existingRefund = await adminDb
            .collection("refunds")
            .where("orderId", "==", body.orderId)
            .where("status", "in", ["initiated", "processing", "completed"])
            .get();

        if (!existingRefund.empty) {
            const refund = existingRefund.docs[0].data();
            return NextResponse.json(
                {
                    error: "Refund already exists for this order",
                    existingRefund: {
                        status: refund.status,
                        amount: refund.refundAmount,
                        id: existingRefund.docs[0].id
                    }
                },
                { status: 400 }
            );
        }

        // Generate unique refund ID
        const refundId = `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // For COD orders, process refund differently (manual transfer)
        if (orderData?.paymentMethod === 'COD') {
            const refundData: RefundData = {
                orderId: body.orderId,
                cfOrderId: body.cfOrderId,
                refundAmount: body.refundAmount,
                refundType: body.refundType,
                reason: body.reason,
                status: 'initiated',
                initiatedBy: body.initiatedBy,
                initiatedAt: new Date(),
            };

            await adminDb.collection("refunds").doc(refundId).set(refundData);

            // Update order status
            await adminDb.collection("orders").doc(body.orderId).update({
                status: 'refund_initiated',
                refundId,
                refundStatus: 'initiated',
                refundAmount: body.refundAmount,
                updatedAt: new Date(),
            });

            return NextResponse.json({
                success: true,
                refundId,
                message: "COD refund initiated - manual transfer required",
                refundData,
            });
        }

        // For online payments, call Cashfree Refund API
        const cashfreeRefundRequest = {
            refund_amount: body.refundAmount,
            refund_id: refundId,
            refund_note: body.reason || "Customer requested refund",
        };

        console.log("Initiating Cashfree refund:", {
            orderId: body.cfOrderId,
            refundId,
            amount: body.refundAmount,
        });

        const response = await fetch(
            `${baseApiUrl}/orders/${body.cfOrderId}/refunds`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-version": "2025-01-01",
                    "x-client-id": clientId,
                    "x-client-secret": secretKey,
                },
                body: JSON.stringify(cashfreeRefundRequest),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("Cashfree refund error:", data);

            // Still save the failed refund attempt
            const failedRefundData: RefundData = {
                orderId: body.orderId,
                cfOrderId: body.cfOrderId,
                refundAmount: body.refundAmount,
                refundType: body.refundType,
                reason: body.reason,
                status: 'failed',
                initiatedBy: body.initiatedBy,
                initiatedAt: new Date(),
                cashfreeResponse: data,
                errorMessage: data.message || "Refund failed",
            };

            await adminDb.collection("refunds").doc(refundId).set(failedRefundData);

            return NextResponse.json(
                {
                    error: "Refund failed",
                    details: data,
                    refundId,
                },
                { status: response.status }
            );
        }

        // Save successful refund
        const refundData: RefundData = {
            orderId: body.orderId,
            cfOrderId: body.cfOrderId,
            cfRefundId: data.cf_refund_id,
            refundAmount: body.refundAmount,
            refundType: body.refundType,
            reason: body.reason,
            status: data.refund_status === 'SUCCESS' ? 'completed' : 'processing',
            initiatedBy: body.initiatedBy,
            initiatedAt: new Date(),
            cashfreeResponse: data,
        };

        await adminDb.collection("refunds").doc(refundId).set(refundData);

        // Update order status
        await adminDb.collection("orders").doc(body.orderId).update({
            status: data.refund_status === 'SUCCESS' ? 'refunded' : 'refund_processing',
            refundId,
            refundStatus: refundData.status,
            refundAmount: body.refundAmount,
            cfRefundId: data.cf_refund_id,
            updatedAt: new Date(),
        });

        console.log("Refund initiated successfully:", {
            refundId,
            cfRefundId: data.cf_refund_id,
            status: data.refund_status,
        });

        return NextResponse.json({
            success: true,
            refundId,
            cfRefundId: data.cf_refund_id,
            status: refundData.status,
            message: "Refund initiated successfully",
            cashfreeResponse: data,
        });
    } catch (error) {
        console.error("Refund API error:", error);
        return NextResponse.json(
            { error: "Failed to process refund" },
            { status: 500 }
        );
    }
}

/**
 * Get refund status
 * GET /api/cashfree/refund?orderId=xxx&refundId=xxx
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const cfOrderId = searchParams.get("cfOrderId");
        const refundId = searchParams.get("refundId");

        if (!cfOrderId || !refundId) {
            return NextResponse.json(
                { error: "cfOrderId and refundId are required" },
                { status: 400 }
            );
        }

        // Fetch from Cashfree
        const response = await fetch(
            `${baseApiUrl}/orders/${cfOrderId}/refunds/${refundId}`,
            {
                method: "GET",
                headers: {
                    "x-api-version": "2025-01-01",
                    "x-client-id": clientId,
                    "x-client-secret": secretKey,
                },
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: "Failed to fetch refund status", details: data },
                { status: response.status }
            );
        }

        // Update local refund record if status changed
        const refundDoc = await adminDb
            .collection("refunds")
            .where("cfRefundId", "==", data.cf_refund_id)
            .limit(1)
            .get();

        if (!refundDoc.empty) {
            const doc = refundDoc.docs[0];
            const currentStatus = doc.data().status;
            const newStatus = data.refund_status === 'SUCCESS' ? 'completed' :
                data.refund_status === 'PENDING' ? 'processing' : 'failed';

            if (currentStatus !== newStatus) {
                await doc.ref.update({
                    status: newStatus,
                    completedAt: newStatus === 'completed' ? new Date() : null,
                    updatedAt: new Date(),
                });
            }
        }

        return NextResponse.json({
            success: true,
            refundStatus: data.refund_status,
            refundAmount: data.refund_amount,
            cfRefundId: data.cf_refund_id,
            processedAt: data.processed_at,
            data,
        });
    } catch (error) {
        console.error("Refund status fetch error:", error);
        return NextResponse.json(
            { error: "Failed to fetch refund status" },
            { status: 500 }
        );
    }
}
