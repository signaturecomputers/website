import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

/**
 * Get invoice by invoice number
 * GET /api/invoice/get?invoice=SC/25-26/0001
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const invoiceNumber = searchParams.get("invoice");

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

        const invoiceData = invoiceDoc.data();

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
