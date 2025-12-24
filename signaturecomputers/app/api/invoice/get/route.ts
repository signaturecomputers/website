import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

/**
 * Get invoice by invoice number
 * GET /api/invoice/get?invoice=SC/25-26/0001&includeOrderData=true
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const invoiceNumber = searchParams.get("invoice");
        const includeOrderData = searchParams.get("includeOrderData") === "true";

        if (!invoiceNumber) {
            return NextResponse.json(
                { error: "Invoice number is required" },
                { status: 400 }
            );
        }

        // Fetch invoice from Firestore
        const invoiceDoc = await adminDb
            .collection("invoices")
            .doc(invoiceNumber)
            .get();

        if (!invoiceDoc.exists) {
            return NextResponse.json(
                { error: "Invoice not found" },
                { status: 404 }
            );
        }

        const invoiceData = invoiceDoc.data() as Record<string, any>;

        // Convert Firestore timestamps to ISO strings
        if (invoiceData?.invoiceDate?.toDate) {
            invoiceData.invoiceDate = invoiceData.invoiceDate.toDate().toISOString();
        }
        if (invoiceData?.orderDate?.toDate) {
            invoiceData.orderDate = invoiceData.orderDate.toDate().toISOString();
        }
        if (invoiceData?.createdAt?.toDate) {
            invoiceData.createdAt = invoiceData.createdAt.toDate().toISOString();
        }

        // If requested, fetch additional order data for status and refund info
        if (includeOrderData) {
            try {
                let orderDoc = null;
                let orderData = null;

                // First try by firestoreOrderId (new invoices)
                if (invoiceData?.firestoreOrderId) {
                    const doc = await adminDb
                        .collection("orders")
                        .doc(invoiceData.firestoreOrderId)
                        .get();
                    if (doc.exists) {
                        orderDoc = doc;
                        orderData = doc.data() as Record<string, any>;
                    }
                }

                // Fallback: Search by orderId field (older invoices)
                if (!orderData && invoiceData?.orderId) {
                    const ordersQuery = await adminDb
                        .collection("orders")
                        .where("orderId", "==", invoiceData.orderId)
                        .limit(1)
                        .get();

                    if (!ordersQuery.empty) {
                        orderDoc = ordersQuery.docs[0];
                        orderData = orderDoc.data() as Record<string, any>;
                        // Save the firestoreOrderId for future lookups
                        invoiceData.firestoreOrderId = orderDoc.id;
                    }
                }

                if (orderData) {
                    // Add order status info to invoice data
                    invoiceData.orderStatus = orderData.orderStatus || orderData.status || 'placed';
                    invoiceData.paymentStatus = orderData.paymentStatus || 'pending';

                    // Add refund info if available
                    invoiceData.refundStatus = orderData.refundStatus || 'not_initiated';
                    invoiceData.refundAmount = orderData.refundAmount || null;
                    invoiceData.refundTransactionId = orderData.cfRefundId || orderData.refundId || null;
                    invoiceData.cfOrderId = orderData.cfOrderId || null;

                    // Convert refund date if available
                    if (orderData.refundCompletedAt?.toDate) {
                        invoiceData.refundDate = orderData.refundCompletedAt.toDate().toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                        });
                    } else if (orderData.refundInitiatedAt?.toDate) {
                        invoiceData.refundDate = orderData.refundInitiatedAt.toDate().toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                        });
                    }
                }
            } catch (orderError) {
                console.error("Error fetching order data:", orderError);
                // Continue without order data - just show invoice
            }
        }

        return NextResponse.json({
            success: true,
            invoiceNumber,
            invoiceData,
        });
    } catch (error) {
        console.error("Invoice fetch error:", error);
        return NextResponse.json(
            { error: "Failed to fetch invoice" },
            { status: 500 }
        );
    }
}
