import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import puppeteer from "puppeteer";
import { COMPANY_INFO, numberToWords } from "@/lib/invoice";

/**
 * Generate PDF for an invoice - Full A4 Page Size
 * GET /api/invoice/pdf?invoice=SC/25-26/0001&admin=true
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const invoiceNumber = searchParams.get("invoice");
        const isAdmin = searchParams.get("admin") === "true";

        if (!invoiceNumber) {
            return NextResponse.json(
                { error: "Invoice number is required" },
                { status: 400 }
            );
        }

        // Fetch invoice from Firestore
        const invoiceDoc = await adminDb.collection("invoices").doc(invoiceNumber).get();

        if (!invoiceDoc.exists) {
            return NextResponse.json(
                { error: "Invoice not found" },
                { status: 404 }
            );
        }

        const invoice = invoiceDoc.data() as Record<string, any>;

        // Fetch order data for status and refund info
        let orderData: Record<string, any> | null = null;
        if (invoice?.firestoreOrderId) {
            try {
                const orderDoc = await adminDb.collection("orders").doc(invoice.firestoreOrderId).get();
                if (orderDoc.exists) {
                    orderData = orderDoc.data() as Record<string, any>;
                }
            } catch (e) {
                // Continue without order data
            }
        }

        const orderStatus = orderData?.orderStatus || orderData?.status || 'placed';
        const isCancelled = orderStatus === 'cancelled';
        const refundStatus = orderData?.refundStatus || 'not_initiated';
        const refundAmount = orderData?.refundAmount || invoice?.grandTotal || 0;
        const refundTransactionId = orderData?.cfRefundId || orderData?.refundId || '';

        // If cancelled and not admin, block access
        if (isCancelled && !isAdmin) {
            return NextResponse.json(
                { error: "Invoice not available for cancelled orders" },
                { status: 403 }
            );
        }

        // Fetch admin signature
        let signatureUrl = "";
        try {
            const sigDoc = await adminDb.collection("admin_settings").doc("invoice_signature").get();
            if (sigDoc.exists) {
                signatureUrl = sigDoc.data()?.signatureUrl || "";
            }
        } catch (e) {
            // Signature optional
        }

        // Format amounts  
        const formatCurrency = (amount: number) => {
            return new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                minimumFractionDigits: 2,
            }).format(amount || 0).replace('₹', '₹ ');
        };

        // Get refund status badge HTML
        const getRefundBadgeHtml = (status: string) => {
            const badges: Record<string, { text: string; bg: string; color: string }> = {
                success: { text: '✓ Successful', bg: '#dcfce7', color: '#15803d' },
                completed: { text: '✓ Successful', bg: '#dcfce7', color: '#15803d' },
                processing: { text: '⏳ Processing', bg: '#fef9c3', color: '#ca8a04' },
                initiated: { text: '⏳ Processing', bg: '#fef9c3', color: '#ca8a04' },
                failed: { text: '✗ Failed', bg: '#fee2e2', color: '#dc2626' },
                not_initiated: { text: '⚠ Not Initiated', bg: '#f3f4f6', color: '#6b7280' },
            };
            const badge = badges[status] || badges.not_initiated;
            return `<span style="display: inline-block; padding: 4px 10px; border-radius: 4px; background: ${badge.bg}; color: ${badge.color}; font-weight: 600; font-size: 11px;">${badge.text}</span>`;
        };

        // Generate empty rows if less than 3 items
        const items = invoice.items || [];
        const emptyRowsNeeded = Math.max(0, 3 - items.length);
        const emptyRowsHtml = Array(emptyRowsNeeded).fill('<tr class="empty-row"><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td></tr>').join('');

        // Generate Full A4 HTML
        const invoiceHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        @page {
            size: A4;
            margin: 0;
        }
        
        html, body {
            width: 210mm;
            height: 297mm;
            max-height: 297mm;
            font-family: 'Segoe UI', Arial, sans-serif;
            font-size: 11px;
            color: #1f2937;
            background: white;
            overflow: hidden;
        }
        
        .invoice {
            width: 210mm;
            height: 297mm;
            max-height: 297mm;
            padding: 12mm 15mm;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        
        /* Cancelled Badge */
        .cancelled-badge {
            background: #dc2626;
            color: white;
            text-align: center;
            padding: 10px;
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 15px;
            border-radius: 4px;
        }
        
        /* Header */
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding-bottom: 15px;
            border-bottom: 3px solid #1e3a5f;
            margin-bottom: 10px;
        }
        
        .company-name {
            font-size: 24px;
            font-weight: 700;
            color: #1e3a5f;
            margin-bottom: 8px;
        }
        
        .company-info {
            font-size: 11px;
            color: #4b5563;
            line-height: 1.5;
        }
        
        .company-website {
            color: #2563eb;
        }
        
        .qr-section {
            text-align: center;
        }
        
        .qr-label {
            font-size: 9px;
            color: #9ca3af;
            margin-top: 4px;
        }
        
        /* Cancelled/Refund Status under QR - Single Line */
        .qr-status-line {
            margin-top: 6px;
            padding: 3px 6px;
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 4px;
            font-size: 8px;
            font-weight: 600;
            color: #dc2626;
            white-space: nowrap;
        }
        
        /* GSTIN Bar */
        .gstin-bar {
            display: flex;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 8px 12px;
            font-size: 11px;
            margin-bottom: 10px;
        }
        
        .gstin-bar > div {
            flex: 1;
        }
        
        /* Billing Row */
        .billing-row {
            display: flex;
            border: 1px solid #e2e8f0;
            margin-bottom: 15px;
        }
        
        .billed-to {
            flex: 1;
            padding: 12px 15px;
            border-right: 1px solid #e2e8f0;
        }
        
        .section-heading {
            font-size: 14px;
            font-weight: 700;
            color: #1e3a5f;
            margin-bottom: 8px;
        }
        
        .customer-name {
            font-size: 13px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 5px;
        }
        
        .customer-detail {
            font-size: 11px;
            color: #4b5563;
            margin-bottom: 2px;
        }
        
        .invoice-info {
            flex: 1;
            padding: 12px 15px;
        }
        
        .invoice-title {
            font-size: 20px;
            font-weight: 700;
            color: #1e3a5f;
            text-align: center;
            margin-bottom: 12px;
        }
        
        .meta-line {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            padding: 3px 0;
        }
        
        .meta-label {
            color: #6b7280;
        }
        
        .meta-value {
            font-weight: 600;
            color: #1f2937;
        }
        
        .payment-line {
            padding-top: 8px;
            margin-top: 5px;
            border-top: 1px solid #e5e7eb;
        }
        
        .payment-value {
            color: #059669;
            font-weight: 700;
        }
        
        /* Products Table */
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            flex-grow: 1;
        }
        
        th {
            background: #1e3a5f;
            color: white;
            padding: 10px 8px;
            font-size: 11px;
            font-weight: 600;
            text-align: left;
        }
        
        td {
            padding: 12px 8px;
            border-bottom: 1px solid #e5e7eb;
            vertical-align: top;
            font-size: 11px;
        }
        
        tr:nth-child(even) {
            background: #f9fafb;
        }
        
        .col-sno { width: 40px; }
        .col-part { width: 100px; }
        .col-qty { width: 50px; text-align: center; }
        .col-price { width: 100px; text-align: right; }
        .col-amount { width: 100px; text-align: right; }
        
        .part-no {
            font-family: 'Consolas', monospace;
            font-size: 10px;
            background: #f3f4f6;
            padding: 2px 6px;
            border-radius: 3px;
        }
        
        .na-text {
            color: #9ca3af;
            font-size: 10px;
        }
        
        .product-name {
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 3px;
        }
        
        .warranty {
            font-size: 10px;
            color: #059669;
        }
        
        .empty-row td {
            height: 40px;
        }
        
        /* Totals Row - Amount in Words Left, Totals Right */
        .totals-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-top: 1px solid #e5e7eb;
            padding-top: 10px;
            margin-bottom: 10px;
        }
        
        .amount-words-box {
            flex: 1;
            background: #f8fafc;
            padding: 10px 12px;
            font-size: 11px;
            border: 1px solid #e5e7eb;
            margin-right: 15px;
        }
        
        .amount-words-box p {
            margin: 4px 0 0 0;
            color: #4b5563;
        }
        
        .totals-box {
            width: 200px;
            min-width: 200px;
            border: 1px solid #e5e7eb;
            padding: 8px 12px;
        }
        
        .total-line {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            padding: 3px 0;
            color: #4b5563;
        }
        
        .grand-total {
            display: flex;
            justify-content: space-between;
            font-size: 13px;
            font-weight: 700;
            padding-top: 6px;
            margin-top: 4px;
            border-top: 2px solid #1e3a5f;
            color: #1e3a5f;
        }
        
        /* Refund Box */
        .refund-box {
            background: #fef2f2;
            border: 2px solid #fecaca;
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 15px;
        }
        
        .refund-title {
            font-size: 14px;
            font-weight: 700;
            color: #dc2626;
            margin-bottom: 10px;
        }
        
        .refund-details {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            font-size: 11px;
        }
        
        .refund-label {
            color: #6b7280;
            margin-right: 8px;
        }
        
        .refund-amount {
            font-weight: 700;
            font-size: 13px;
            color: #dc2626;
        }
        
        .refund-txn {
            font-family: 'Consolas', monospace;
            font-size: 10px;
            background: #fee2e2;
            padding: 2px 6px;
            border-radius: 3px;
        }
        
        /* Footer */
        .footer {
            display: flex;
            border-top: 2px solid #1e3a5f;
            padding-top: 15px;
            margin-top: auto;
        }
        
        .terms {
            flex: 1;
            padding-right: 20px;
        }
        
        .terms-title {
            font-size: 12px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 8px;
        }
        
        .terms-list {
            font-size: 10px;
            color: #6b7280;
            padding-left: 15px;
            margin: 0;
        }
        
        .terms-list li {
            margin-bottom: 3px;
        }
        
        .signature {
            width: 180px;
            text-align: right;
        }
        
        .signature-label {
            font-size: 11px;
            color: #4b5563;
            margin-bottom: 8px;
        }
        
        .signature-area {
            height: 50px;
            display: flex;
            justify-content: flex-end;
            align-items: flex-end;
            margin-bottom: 5px;
        }
        
        .signature-img {
            height: 45px;
        }
        
        .signature-line {
            width: 120px;
            border-bottom: 1px solid #9ca3af;
        }
        
        .signatory {
            font-size: 11px;
            font-weight: 600;
            color: #1f2937;
        }
    </style>
</head>
<body>
    <div class="invoice">
        ${isCancelled && isAdmin ? '<div class="cancelled-badge">🔴 ORDER CANCELLED</div>' : ''}
        
        <!-- Header -->
        <div class="header">
            <div>
                <div class="company-name">${invoice.company?.name || COMPANY_INFO.name}</div>
                <div class="company-info">
                    ${invoice.company?.address || COMPANY_INFO.address}<br>
                    Phone: ${invoice.company?.phone || COMPANY_INFO.phone}<br>
                    ${invoice.company?.email || COMPANY_INFO.email}<br>
                    <span class="company-website">${invoice.company?.website || COMPANY_INFO.website}</span>
                </div>
            </div>
            <div class="qr-section">
                <img src="https://chart.googleapis.com/chart?chs=70x70&cht=qr&chl=https://signaturecomputers.in&choe=UTF-8" width="70" height="70" />
                <div class="qr-label">Scan to visit</div>
                ${isCancelled && isAdmin ? `
                <div class="qr-status-line">
                    ⛔ Cancelled | Refund: ${refundStatus === 'success' || refundStatus === 'completed'
                    ? '✓ Success'
                    : refundStatus === 'processing' || refundStatus === 'initiated'
                        ? '⏳ Processing'
                        : '✗ Failed'
                }
                </div>
                ` : ''}
            </div>
        </div>

        <!-- GSTIN Bar -->
        <div class="gstin-bar">
            <div><strong>GSTIN:</strong> ${invoice.company?.gstin || COMPANY_INFO.gstin}</div>
            <div style="text-align:center;"><strong>State Code:</strong> ${invoice.company?.stateCode || COMPANY_INFO.stateCode}</div>
            <div style="text-align:right;"><strong>PAN:</strong> ${invoice.company?.pan || COMPANY_INFO.pan}</div>
        </div>

        <!-- Billing Row -->
        <div class="billing-row">
            <div class="billed-to">
                <div class="section-heading">Billed To</div>
                <div class="customer-name">${invoice.billedTo?.name || ''}</div>
                <div class="customer-detail">${invoice.billedTo?.addressLine1 || ''}</div>
                ${invoice.billedTo?.addressLine2 ? `<div class="customer-detail">${invoice.billedTo.addressLine2}</div>` : ''}
                <div class="customer-detail">${invoice.billedTo?.city || ''}, ${invoice.billedTo?.state || ''} - ${invoice.billedTo?.pincode || ''}</div>
                <div class="customer-detail">Phone: ${invoice.billedTo?.phone || ''}</div>
                ${invoice.billedTo?.email ? `<div class="customer-detail">Email: ${invoice.billedTo.email}</div>` : ''}
            </div>
            <div class="invoice-info">
                <div class="invoice-title">TAX INVOICE</div>
                <div class="meta-line"><span class="meta-label">Order ID:</span><span class="meta-value">${invoice.orderId || ''}</span></div>
                <div class="meta-line"><span class="meta-label">Order Date:</span><span class="meta-value">${invoice.orderDateFormatted || ''}</span></div>
                <div class="meta-line"><span class="meta-label">Invoice No:</span><span class="meta-value">${invoice.invoiceNumber || ''}</span></div>
                <div class="meta-line"><span class="meta-label">Invoice Date:</span><span class="meta-value">${invoice.invoiceDateFormatted || ''}</span></div>
                <div class="meta-line payment-line"><span class="meta-label">Payment:</span><span class="payment-value">${invoice.paymentMode || 'Online'}</span></div>
            </div>
        </div>

        <!-- Products Table -->
        <table>
            <thead>
                <tr>
                    <th class="col-sno">S.No</th>
                    <th class="col-part">Part No.</th>
                    <th>Description</th>
                    <th class="col-qty">Qty</th>
                    <th class="col-price">Unit Price</th>
                    <th class="col-amount">Amount</th>
                </tr>
            </thead>
            <tbody>
                ${items.map((item: any, idx: number) => `
                <tr>
                    <td style="text-align:center;">${idx + 1}</td>
                    <td>${item.productId ? `<span class="part-no">${item.productId}</span>` : '<span class="na-text">N/A</span>'}</td>
                    <td>
                        <div class="product-name">${item.description || ''}</div>
                        ${item.warranty ? `<div class="warranty">✓ ${item.warranty}</div>` : ''}
                    </td>
                    <td style="text-align:center;">${item.quantity || 1}</td>
                    <td style="text-align:right;">${formatCurrency(item.unitPrice)}</td>
                    <td style="text-align:right;font-weight:600;">${formatCurrency(item.amount)}</td>
                </tr>
                `).join('')}
                ${emptyRowsHtml}
            </tbody>
        </table>

        <!-- Totals Row with Amount in Words -->
        <div class="totals-row">
            <!-- Amount in Words - Left Side -->
            <div class="amount-words-box">
                <strong>Amount in Words:</strong>
                <p>${invoice.amountInWords || numberToWords(invoice.grandTotal || 0)}</p>
            </div>
            
            <!-- Totals - Right Side -->
            <div class="totals-box">
                <div class="total-line"><span>Taxable Amount</span><span>${formatCurrency(invoice.taxableAmount)}</span></div>
                ${invoice.cgstAmount > 0 ? `<div class="total-line"><span>CGST @ ${invoice.cgstRate}%</span><span>${formatCurrency(invoice.cgstAmount)}</span></div>` : ''}
                ${invoice.sgstAmount > 0 ? `<div class="total-line"><span>SGST @ ${invoice.sgstRate}%</span><span>${formatCurrency(invoice.sgstAmount)}</span></div>` : ''}
                ${(invoice.igstAmount || 0) > 0 ? `<div class="total-line"><span>IGST @ ${invoice.igstRate}%</span><span>${formatCurrency(invoice.igstAmount)}</span></div>` : ''}
                <div class="grand-total"><span>GRAND TOTAL</span><span>${formatCurrency(invoice.grandTotal)}</span></div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="terms">
                <div class="terms-title">Terms & Conditions:</div>
                <ol class="terms-list">
                    <li>For warranty claims, contact the respective brand's customer care directly.</li>
                    <li>Goods once sold will be accepted for warranty only if they are in good physical condition.</li>
                    <li>Returns require a valid RMA (Return Material Authorization) from Signature Computers.</li>
                    <li>All disputes are subject to Chennai jurisdiction.</li>
                </ol>
            </div>
            <div class="signature">
                <div class="signature-label">For Signature Computers</div>
                <div class="signature-area">
                    ${signatureUrl ? `<img src="${signatureUrl}" class="signature-img" />` : '<div class="signature-line"></div>'}
                </div>
                <div class="signatory">Authorised Signatory</div>
            </div>
        </div>
    </div>
</body>
</html>
        `;

        // Generate PDF using Puppeteer
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setContent(invoiceHtml, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '0', right: '0', bottom: '0', left: '0' }
        });

        await browser.close();

        // Return PDF as response
        return new NextResponse(Buffer.from(pdfBuffer), {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="Invoice-${invoiceNumber.replace(/\//g, '-')}.pdf"`,
                'Cache-Control': 'no-store'
            }
        });
    } catch (error) {
        console.error("PDF generation error:", error);
        return NextResponse.json(
            { error: "Failed to generate PDF" },
            { status: 500 }
        );
    }
}
