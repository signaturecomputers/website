import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import {
    COMPANY_INFO,
    calculateGST,
    getHSNCode,
    generateInvoiceNumber,
    numberToWords,
    formatInvoiceDate,
    getStateCode,
} from "@/lib/invoice";

interface OrderData {
    orderId: string;
    cfOrderId?: string;
    productId: string;
    productName: string;
    productCategory?: string;
    partNumber?: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    customerId: string;
    customerEmail?: string;
    customerName: string;
    phone?: string;
    shippingAddress?: {
        fullName?: string;
        addressLine1?: string;
        addressLine2?: string;
        city?: string;
        state?: string;
        pincode?: string;
    };
    paymentStatus?: string;
    paymentMethod?: string;
    status?: string;
    createdAt?: any;
    invoiceNumber?: string;
    invoiceGenerated?: boolean;
}

/**
 * Generate invoice for an order
 * POST /api/invoice/generate
 */
export async function POST(request: NextRequest) {
    try {
        const { orderId } = await request.json();

        if (!orderId) {
            return NextResponse.json(
                { error: "Order ID is required" },
                { status: 400 }
            );
        }

        // Fetch order from Firestore
        const orderDoc = await adminDb.collection("orders").doc(orderId).get();

        if (!orderDoc.exists) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 }
            );
        }

        const orderData = orderDoc.data() as OrderData;

        // Check if invoice already exists
        if (orderData.invoiceNumber) {
            // Fetch existing invoice
            const invoiceDoc = await adminDb
                .collection("invoices")
                .doc(orderData.invoiceNumber)
                .get();

            if (invoiceDoc.exists) {
                return NextResponse.json({
                    invoiceNumber: orderData.invoiceNumber,
                    invoiceData: invoiceDoc.data(),
                    message: "Invoice already exists",
                });
            }
        }

        // Get next invoice sequence number
        const counterRef = adminDb.collection("counters").doc("invoices");
        const counterDoc = await counterRef.get();
        let sequenceNumber = 1;

        if (counterDoc.exists) {
            sequenceNumber = (counterDoc.data()?.lastSequence || 0) + 1;
        }

        // Generate invoice number
        const invoiceNumber = generateInvoiceNumber(sequenceNumber);

        // Get customer state for GST calculation
        const customerState = orderData.shippingAddress?.state || "Tamil Nadu";
        const customerStateCode = getStateCode(customerState);

        // Calculate GST
        const gstDetails = calculateGST(orderData.unitPrice * orderData.quantity, customerState);

        // Get HSN code
        const hsnCode = getHSNCode(orderData.productCategory || "laptops");

        // Calculate delivery charges (can be configured in settings)
        const deliveryCharges = 0; // Free delivery typically, or fetch from settings

        // Prepare invoice data
        const invoiceData = {
            invoiceNumber,
            orderId: orderData.orderId,
            cfOrderId: orderData.cfOrderId || "",
            invoiceDate: new Date(),
            invoiceDateFormatted: formatInvoiceDate(new Date()),

            // Company Info
            company: COMPANY_INFO,

            // Customer Info (Billed To / Shipped To)
            billedTo: {
                name: orderData.customerName,
                addressLine1: orderData.shippingAddress?.addressLine1 || "",
                addressLine2: orderData.shippingAddress?.addressLine2 || "",
                city: orderData.shippingAddress?.city || "",
                state: customerState,
                pincode: orderData.shippingAddress?.pincode || "",
                stateCode: customerStateCode,
                phone: orderData.phone || "",
                email: orderData.customerEmail || "",
                gstin: "", // Customer GSTIN if B2B
            },
            shippedTo: {
                name: orderData.customerName,
                addressLine1: orderData.shippingAddress?.addressLine1 || "",
                addressLine2: orderData.shippingAddress?.addressLine2 || "",
                city: orderData.shippingAddress?.city || "",
                state: customerState,
                pincode: orderData.shippingAddress?.pincode || "",
                stateCode: customerStateCode,
                phone: orderData.phone || "",
            },

            // Order Details
            termsOfDelivery: "DELIVERY",
            paymentMode: orderData.paymentMethod === "COD" ? "COD" : "Online Payment",

            // Items
            items: [
                {
                    sno: 1,
                    description: orderData.productName,
                    partNumber: orderData.partNumber || "",
                    hsnCode,
                    quantity: orderData.quantity,
                    unit: "Nos",
                    grossRate: orderData.unitPrice,
                    discount: 0,
                    netRate: orderData.unitPrice,
                    amount: orderData.unitPrice * orderData.quantity,
                },
            ],

            // Tax Details
            taxableAmount: gstDetails.taxableAmount,
            cgstRate: gstDetails.cgstRate,
            cgstAmount: gstDetails.cgstAmount,
            sgstRate: gstDetails.sgstRate,
            sgstAmount: gstDetails.sgstAmount,
            igstRate: gstDetails.igstRate,
            igstAmount: gstDetails.igstAmount,
            totalTax: gstDetails.totalTax,

            // Totals
            deliveryCharges,
            grandTotal: gstDetails.taxableAmount + gstDetails.totalTax + deliveryCharges,
            amountInWords: numberToWords(
                gstDetails.taxableAmount + gstDetails.totalTax + deliveryCharges
            ),

            // Metadata
            createdAt: new Date(),
            customerId: orderData.customerId,
        };

        // Save invoice to Firestore
        await adminDb.collection("invoices").doc(invoiceNumber).set(invoiceData);

        // Update counter
        await counterRef.set({ lastSequence: sequenceNumber });

        // Update order with invoice number
        await adminDb.collection("orders").doc(orderId).update({
            invoiceNumber,
            invoiceGenerated: true,
            invoiceGeneratedAt: new Date(),
        });

        return NextResponse.json({
            success: true,
            invoiceNumber,
            invoiceData,
        });
    } catch (error) {
        console.error("Invoice generation error:", error);
        return NextResponse.json(
            { error: "Failed to generate invoice" },
            { status: 500 }
        );
    }
}
