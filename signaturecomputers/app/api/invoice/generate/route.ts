import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import {
    COMPANY_INFO,
    generateInvoiceNumber,
    numberToWords,
    formatInvoiceDate,
    getStateCode,
    isIntraState,
} from "@/lib/invoice";

interface OrderData {
    orderId: string;
    cfOrderId?: string;
    productId: string;
    productName: string;
    productCategory?: string;
    partNumber?: string;
    quantity: number;
    unitPrice?: number;
    totalAmount: number;
    customerId: string;
    customerEmail?: string;
    customerName: string;
    phone?: string;
    shippingAddress?: {
        fullName?: string;
        phone?: string;
        addressLine1?: string;
        addressLine2?: string;
        city?: string;
        state?: string;
        pincode?: string;
    };
    billingAddress?: {
        fullName?: string;
        phone?: string;
        addressLine1?: string;
        addressLine2?: string;
        city?: string;
        state?: string;
        pincode?: string;
    };
    paymentStatus?: string;
    paymentMethod?: string | { [key: string]: unknown };
    status?: string;
    createdAt?: any;
    invoiceNumber?: string;
    invoiceGenerated?: boolean;
    warranty?: string;
    windowsInstallation?: boolean;
    windowsInstallationPrice?: number;
    carePack?: {
        title: string;
        duration: string;
        price: number;
        partNumber: string;
    } | null;
}

/**
 * Determine the payment mode for display on invoice
 * Only shows UPI, Card, or Net Banking
 */
function getPaymentMode(paymentMethod: string | { [key: string]: unknown } | undefined): 'UPI' | 'Card' | 'Net Banking' | 'Online Payment' {
    if (!paymentMethod) return 'Online Payment';

    // If it's an object (from Cashfree webhook), extract the method
    const method = typeof paymentMethod === 'object'
        ? Object.keys(paymentMethod)[0]?.toLowerCase()
        : paymentMethod.toLowerCase();

    if (method.includes('upi')) return 'UPI';
    if (method.includes('card') || method.includes('credit') || method.includes('debit')) return 'Card';
    if (method.includes('netbanking') || method.includes('net_banking') || method.includes('nb')) return 'Net Banking';

    return 'Online Payment';
}

/**
 * Generate warranty text based on product category
 */
function getWarrantyInfo(category?: string, productName?: string): string {
    const name = (productName || '').toLowerCase();
    const cat = (category || '').toLowerCase();

    // HP products
    if (name.includes('hp') || name.includes('hewlett') || name.includes('probook') || name.includes('elitebook')) {
        return '3 Years Warranty – Provided by HP';
    }
    // Dell products
    if (name.includes('dell')) {
        return '3 Years Warranty – Provided by Dell';
    }
    // Lenovo products  
    if (name.includes('lenovo') || name.includes('thinkpad') || name.includes('ideapad')) {
        return '3 Years Warranty – Provided by Lenovo';
    }
    // Acer products
    if (name.includes('acer') || name.includes('predator') || name.includes('aspire')) {
        return '2 Years Warranty – Provided by Acer';
    }
    // ASUS products
    if (name.includes('asus') || name.includes('rog') || name.includes('zenbook') || name.includes('vivobook')) {
        return '2 Years Warranty – Provided by ASUS';
    }
    // Laptops, Desktops, Workstations - default manufacturer warranty
    if (cat.includes('laptop') || cat.includes('desktop') || cat.includes('workstation')) {
        return '1 Year Warranty – Manufacturer';
    }
    // Monitors
    if (cat.includes('monitor')) {
        return '3 Years Warranty – Manufacturer';
    }
    // Memory & Storage
    if (cat.includes('memory') || cat.includes('storage')) {
        return '3 Years Warranty – Manufacturer';
    }
    // Accessories - Signature Computers warranty
    if (cat.includes('keyboard') || cat.includes('mouse') || cat.includes('headphone') ||
        cat.includes('cable') || cat.includes('bag') || cat.includes('dock') || cat.includes('usb')) {
        return '6 Months Warranty – Signature Computers';
    }

    return '1 Year Warranty – Signature Computers';
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
        const address = orderData.billingAddress || orderData.shippingAddress;
        const customerState = address?.state || "Tamil Nadu";
        const customerStateCode = getStateCode(customerState);

        // =====================================================
        // PRICE LOGIC: Grand Total = Paid Amount (INCLUDES GST)
        // =====================================================
        const grandTotal = orderData.totalAmount || 0;
        const quantity = orderData.quantity || 1;

        // Unit price = total / quantity (this is the per-unit price INCLUDING GST)
        const unitPrice = orderData.unitPrice || (grandTotal / quantity);

        // GST is ALREADY INCLUDED in the price
        // Reverse calculate: Taxable Amount = Grand Total / 1.18
        const taxableAmount = Math.round((grandTotal / 1.18) * 100) / 100;

        // Calculate GST components from taxable amount
        const intraState = isIntraState(customerState);
        let cgstRate = 0, cgstAmount = 0, sgstRate = 0, sgstAmount = 0, igstRate = 0, igstAmount = 0;

        if (intraState) {
            // CGST + SGST (9% each) - calculated from taxable amount
            cgstRate = 9;
            sgstRate = 9;
            cgstAmount = Math.round((taxableAmount * 0.09) * 100) / 100;
            sgstAmount = Math.round((taxableAmount * 0.09) * 100) / 100;
        } else {
            // IGST (18%) for inter-state
            igstRate = 18;
            igstAmount = Math.round((taxableAmount * 0.18) * 100) / 100;
        }

        // Get warranty info for the product
        const warrantyInfo = getWarrantyInfo(orderData.productCategory, orderData.productName);

        // Get order creation date
        const orderDate = orderData.createdAt?.toDate?.() || new Date();

        // Get part number - check multiple possible locations
        const partNumber = orderData.partNumber || "";

        // Prepare invoice data - Clean, modern format
        const invoiceData = {
            invoiceNumber,
            orderId: orderData.orderId,
            invoiceDate: new Date(),
            invoiceDateFormatted: formatInvoiceDate(new Date()),
            orderDate,
            orderDateFormatted: formatInvoiceDate(orderDate),

            // Company Info
            company: COMPANY_INFO,

            // Customer Info (Billed To only - no Ship To)
            billedTo: {
                name: address?.fullName || orderData.customerName,
                addressLine1: address?.addressLine1 || "",
                addressLine2: address?.addressLine2 || "",
                city: address?.city || "",
                state: customerState,
                pincode: address?.pincode || "",
                stateCode: customerStateCode,
                phone: address?.phone || orderData.phone || "",
                email: orderData.customerEmail || "",
            },

            // Payment Mode (UPI / Card / Net Banking only - No COD)
            paymentMode: getPaymentMode(orderData.paymentMethod),

            // Items - Price includes GST
            items: (() => {
                const list = [];
                let sno = 1;
                
                // Base laptop product
                const baseLaptopTotal = (orderData.unitPrice || (grandTotal / quantity)) * quantity;
                list.push({
                    sno: sno++,
                    productId: partNumber || "PRODUCT",
                    description: orderData.productName,
                    warranty: warrantyInfo,
                    quantity: quantity,
                    unitPrice: orderData.unitPrice || (grandTotal / quantity),
                    amount: baseLaptopTotal
                });

                // Windows installation addon
                if (orderData.windowsInstallation && orderData.windowsInstallationPrice) {
                    const windowsTotal = orderData.windowsInstallationPrice * quantity;
                    list.push({
                        sno: sno++,
                        productId: "WIN11PRO-OEM",
                        description: "Windows 11 Pro OEM Key & Installation Add-on",
                        warranty: "Signature Computers Installation Support",
                        quantity: quantity,
                        unitPrice: orderData.windowsInstallationPrice,
                        amount: windowsTotal
                    });
                }

                // HP Care Pack addon
                if (orderData.carePack) {
                    const carePackTotal = orderData.carePack.price * quantity;
                    list.push({
                        sno: sno++,
                        productId: orderData.carePack.partNumber || "HP-CAREPACK",
                        description: `${orderData.carePack.title} (${orderData.carePack.duration})`,
                        warranty: "HP Official Extended Warranty",
                        quantity: quantity,
                        unitPrice: orderData.carePack.price,
                        amount: carePackTotal
                    });
                }

                return list;
            })(),

            // Tax Details (reverse calculated from Grand Total)
            // Grand Total INCLUDES GST, so we extract it
            taxableAmount: taxableAmount,
            cgstRate,
            cgstAmount,
            sgstRate,
            sgstAmount,
            igstRate,
            igstAmount,

            // Grand Total = Exactly what customer paid (INCLUDES GST)
            grandTotal: grandTotal,
            amountInWords: numberToWords(grandTotal),

            // Metadata
            createdAt: new Date(),
            customerId: orderData.customerId,
            firestoreOrderId: orderId, // Firestore document ID for order lookups
            cfOrderId: orderData.cfOrderId || null, // Cashfree order ID for refunds
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
