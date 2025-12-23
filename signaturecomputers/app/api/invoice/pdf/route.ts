import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import puppeteer from "puppeteer";
import { COMPANY_INFO, formatInvoiceDate, numberToWords } from "@/lib/invoice";

/**
 * Generate PDF for an invoice
 * GET /api/invoice/pdf?invoice=SC/25-26/0001
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
        const invoiceDoc = await adminDb.collection("invoices").doc(invoiceNumber).get();

        if (!invoiceDoc.exists) {
            return NextResponse.json(
                { error: "Invoice not found" },
                { status: 404 }
            );
        }

        const invoice = invoiceDoc.data();

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

        // Generate HTML for the invoice
        const invoiceHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 12px; color: #333; }
        .invoice { max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 15px; display: flex; justify-content: space-between; }
        .company-name { font-size: 20px; font-weight: bold; margin-bottom: 8px; }
        .company-details { font-size: 11px; color: #666; }
        .company-details p { margin: 2px 0; }
        .qr-section { text-align: center; }
        .qr-placeholder { width: 70px; height: 70px; border: 1px solid #ccc; display: flex; align-items: center; justify-content: center; margin: 0 auto; font-size: 10px; color: #999; }
        .gstin-row { display: flex; border-bottom: 1px solid #999; font-size: 11px; }
        .gstin-row > div { padding: 8px; }
        .gstin-row > div:not(:last-child) { border-right: 1px solid #999; }
        .main-content { display: flex; border-bottom: 1px solid #999; }
        .left-section { width: 50%; padding: 12px; border-right: 1px solid #999; }
        .right-section { width: 50%; padding: 12px; }
        .section-title { font-size: 14px; font-weight: bold; color: #1e40af; margin-bottom: 10px; }
        .customer-name { font-weight: 600; margin-bottom: 5px; }
        .customer-details { font-size: 11px; color: #666; }
        .meta-row { display: flex; justify-content: space-between; margin: 5px 0; font-size: 11px; }
        .meta-label { color: #666; }
        .meta-value { font-weight: 500; }
        .payment-mode { color: #15803d; font-weight: 600; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #f3f4f6; padding: 10px; text-align: left; border-bottom: 1px solid #999; font-size: 11px; }
        td { padding: 10px; border-bottom: 1px solid #ddd; font-size: 11px; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .product-name { font-weight: 600; }
        .warranty { font-size: 10px; color: #15803d; margin-top: 4px; }
        .part-no { font-family: monospace; font-size: 10px; background: #f3f4f6; padding: 2px 6px; border-radius: 3px; }
        .totals-section { display: flex; justify-content: flex-end; padding: 15px; border-bottom: 1px solid #999; }
        .totals-table { width: 280px; }
        .totals-table td { padding: 4px 0; font-size: 11px; }
        .totals-table .label { text-align: right; padding-right: 15px; color: #666; }
        .totals-table .value { text-align: right; }
        .grand-total { border-top: 2px solid #333; font-size: 14px !important; font-weight: bold; }
        .grand-total .value { color: #1e40af; }
        .amount-words { background: #f9fafb; padding: 10px 15px; border-bottom: 1px solid #999; font-size: 11px; }
        .footer { display: flex; padding: 15px; }
        .terms { width: 60%; font-size: 10px; color: #666; }
        .terms p { margin: 3px 0; }
        .terms-title { font-weight: 600; color: #333; margin-bottom: 8px; }
        .signature-section { width: 40%; text-align: right; }
        .signature-label { margin-bottom: 8px; }
        .signature-line { width: 120px; border-bottom: 1px solid #999; height: 40px; display: inline-block; }
        .signature-img { height: 40px; object-fit: contain; }
        .signatory-text { font-weight: 600; font-size: 11px; margin-top: 5px; }
    </style>
</head>
<body>
    <div class="invoice">
        <!-- Header -->
        <div class="header">
            <div>
                <div class="company-name">${invoice.company?.name || COMPANY_INFO.name}</div>
                <div class="company-details">
                    <p>${invoice.company?.address || COMPANY_INFO.address}</p>
                    <p>Phone: ${invoice.company?.phone || COMPANY_INFO.phone}</p>
                    <p>${invoice.company?.email || COMPANY_INFO.email}</p>
                    <p style="color: #2563eb;">${invoice.company?.website || COMPANY_INFO.website}</p>
                </div>
            </div>
            <div class="qr-section">
                <img src="https://chart.googleapis.com/chart?chs=80x80&cht=qr&chl=https://signaturecomputers.in&choe=UTF-8" alt="QR Code" style="width: 70px; height: 70px;" />
                <p style="font-size: 10px; color: #999; margin-top: 5px;">Scan to visit</p>
            </div>
        </div>

        <!-- GSTIN Row -->
        <div class="gstin-row">
            <div style="flex: 1;"><strong>GSTIN:</strong> ${invoice.company?.gstin || COMPANY_INFO.gstin}</div>
            <div style="flex: 1; text-align: center;"><strong>State Code:</strong> ${invoice.company?.stateCode || COMPANY_INFO.stateCode}</div>
            <div style="flex: 1; text-align: right;"><strong>PAN:</strong> ${invoice.company?.pan || COMPANY_INFO.pan}</div>
        </div>

        <!-- Main Content -->
        <div class="main-content">
            <div class="left-section">
                <div class="section-title">Billed To</div>
                <div class="customer-name">${invoice.billedTo?.name || ''}</div>
                <div class="customer-details">
                    <p>${invoice.billedTo?.addressLine1 || ''}</p>
                    ${invoice.billedTo?.addressLine2 ? `<p>${invoice.billedTo.addressLine2}</p>` : ''}
                    <p>${invoice.billedTo?.city || ''}, ${invoice.billedTo?.state || ''} - ${invoice.billedTo?.pincode || ''}</p>
                    <p style="margin-top: 8px;">Phone: ${invoice.billedTo?.phone || ''}</p>
                    ${invoice.billedTo?.email ? `<p>Email: ${invoice.billedTo.email}</p>` : ''}
                </div>
            </div>
            <div class="right-section">
                <div class="section-title" style="text-align: center;">TAX INVOICE</div>
                <div class="meta-row"><span class="meta-label">Order ID:</span><span class="meta-value">${invoice.orderId || ''}</span></div>
                <div class="meta-row"><span class="meta-label">Order Date:</span><span class="meta-value">${invoice.orderDateFormatted || ''}</span></div>
                <div class="meta-row"><span class="meta-label">Invoice No:</span><span class="meta-value">${invoice.invoiceNumber || ''}</span></div>
                <div class="meta-row"><span class="meta-label">Invoice Date:</span><span class="meta-value">${invoice.invoiceDateFormatted || ''}</span></div>
                <div class="meta-row" style="border-top: 1px solid #ddd; padding-top: 8px; margin-top: 8px;">
                    <span class="meta-label">Mode of Payment:</span>
                    <span class="payment-mode">${invoice.paymentMode || 'Online Payment'}</span>
                </div>
            </div>
        </div>

        <!-- Items Table -->
        <table>
            <thead>
                <tr>
                    <th style="width: 40px;">S.No</th>
                    <th style="width: 100px;">Part No.</th>
                    <th style="width: 40%;">Description</th>
                    <th class="text-center" style="width: 50px;">Qty</th>
                    <th class="text-right">Unit Price<br><span style="font-weight: normal; font-size: 10px;">(Incl. GST)</span></th>
                    <th class="text-right">Amount<br><span style="font-weight: normal; font-size: 10px;">(Incl. GST)</span></th>
                </tr>
            </thead>
            <tbody>
                ${(invoice.items || []).map((item: any, idx: number) => `
                <tr>
                    <td class="text-center">${idx + 1}</td>
                    <td>${item.productId ? `<span class="part-no">${item.productId}</span>` : '<span style="color: #999;">N/A</span>'}</td>
                    <td>
                        <div class="product-name">${item.description || ''}</div>
                        ${item.warranty ? `<div class="warranty">✓ ${item.warranty}</div>` : ''}
                    </td>
                    <td class="text-center">${item.quantity || 1}</td>
                    <td class="text-right">${formatCurrency(item.unitPrice)}</td>
                    <td class="text-right" style="font-weight: 500;">${formatCurrency(item.amount)}</td>
                </tr>
                `).join('')}
                <tr style="height: 60px;"><td colspan="6"></td></tr>
            </tbody>
        </table>

        <!-- Totals -->
        <div class="totals-section">
            <table class="totals-table">
                <tr>
                    <td class="label">Taxable Amount</td>
                    <td class="value">${formatCurrency(invoice.taxableAmount)}</td>
                </tr>
                ${invoice.cgstAmount > 0 ? `
                <tr>
                    <td class="label">CGST @ ${invoice.cgstRate}%</td>
                    <td class="value">${formatCurrency(invoice.cgstAmount)}</td>
                </tr>
                ` : ''}
                ${invoice.sgstAmount > 0 ? `
                <tr>
                    <td class="label">SGST @ ${invoice.sgstRate}%</td>
                    <td class="value">${formatCurrency(invoice.sgstAmount)}</td>
                </tr>
                ` : ''}
                ${(invoice.igstAmount || 0) > 0 ? `
                <tr>
                    <td class="label">IGST @ ${invoice.igstRate}%</td>
                    <td class="value">${formatCurrency(invoice.igstAmount)}</td>
                </tr>
                ` : ''}
                <tr class="grand-total">
                    <td class="label" style="padding-top: 10px;">GRAND TOTAL</td>
                    <td class="value" style="padding-top: 10px;">${formatCurrency(invoice.grandTotal)}</td>
                </tr>
            </table>
        </div>

        <!-- Amount in Words -->
        <div class="amount-words">
            <strong>Amount in Words:</strong> ${invoice.amountInWords || numberToWords(invoice.grandTotal || 0)}
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="terms">
                <div class="terms-title">Terms & Conditions:</div>
                <p>1. For warranty claims, contact the respective brand's customer care directly.</p>
                <p>2. Goods once sold will be accepted for warranty only if they are in good physical condition.</p>
                <p>3. Returns require a valid RMA (Return Material Authorization) from Signature Computers.</p>
                <p>4. All disputes are subject to Chennai jurisdiction.</p>
            </div>
            <div class="signature-section">
                <div class="signature-label">For Signature Computers</div>
                <div>
                    ${signatureUrl ? `<img src="${signatureUrl}" class="signature-img" alt="Signature"/>` : '<div class="signature-line"></div>'}
                </div>
                <div class="signatory-text">Authorised Signatory</div>
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
            margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
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
