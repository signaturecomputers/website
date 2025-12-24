'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { FiDownload, FiPrinter, FiArrowLeft, FiRefreshCw, FiCheck, FiX, FiClock, FiAlertCircle } from 'react-icons/fi';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';

interface InvoiceData {
    invoiceNumber: string;
    orderId: string;
    firestoreOrderId?: string;
    invoiceDateFormatted: string;
    orderDateFormatted: string;
    company: {
        name: string;
        address: string;
        phone: string;
        email: string;
        website: string;
        gstin: string;
        pan: string;
        stateCode: string;
    };
    billedTo: {
        name: string;
        addressLine1: string;
        addressLine2?: string;
        city: string;
        state: string;
        pincode: string;
        stateCode: string;
        phone: string;
        email?: string;
    };
    paymentMode: 'UPI' | 'Card' | 'Net Banking' | 'Online Payment';
    items: Array<{
        sno: number;
        productId?: string;
        description: string;
        warranty?: string;
        quantity: number;
        unitPrice: number;
        amount: number;
    }>;
    taxableAmount: number;
    cgstRate: number;
    cgstAmount: number;
    sgstRate: number;
    sgstAmount: number;
    igstRate?: number;
    igstAmount?: number;
    grandTotal: number;
    amountInWords: string;
    signatureUrl?: string;
    orderStatus?: string;
    paymentStatus?: string;
    refundStatus?: 'not_initiated' | 'initiated' | 'processing' | 'completed' | 'success' | 'failed' | 'none';
    refundAmount?: number;
    refundTransactionId?: string;
    refundDate?: string;
    cfOrderId?: string;
}

function InvoiceViewContent() {
    const searchParams = useSearchParams();
    const invoiceNumber = searchParams.get('invoice');
    const orderId = searchParams.get('orderId');
    const isAdmin = searchParams.get('admin') === 'true';
    const autoPrint = searchParams.get('print') === 'true'; // Auto-trigger print for admin

    const [invoice, setInvoice] = useState<InvoiceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
    const [retryingRefund, setRetryingRefund] = useState(false);
    const [hasPrinted, setHasPrinted] = useState(false); // Prevent multiple print dialogs
    const invoiceRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function fetchInvoice() {
            try {
                const endpoint = invoiceNumber
                    ? `/api/invoice/get?invoice=${encodeURIComponent(invoiceNumber)}&includeOrderData=true`
                    : `/api/invoice/generate`;

                const response = await fetch(endpoint, {
                    method: invoiceNumber ? 'GET' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: invoiceNumber ? undefined : JSON.stringify({ orderId }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch invoice');
                }

                const invoiceData = data.invoiceData;

                if (invoiceData.orderStatus === 'cancelled' && !isAdmin) {
                    throw new Error('Invoice not available for cancelled orders');
                }

                setInvoice(invoiceData);

                try {
                    const signatureRes = await fetch('/api/admin/signature');
                    if (signatureRes.ok) {
                        const sigData = await signatureRes.json();
                        if (sigData.signatureUrl) {
                            setSignatureUrl(sigData.signatureUrl);
                        }
                    }
                } catch {
                    // Signature is optional
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load invoice');
            } finally {
                setLoading(false);
            }
        }

        if (invoiceNumber || orderId) {
            fetchInvoice();
        } else {
            setError('No invoice or order specified');
            setLoading(false);
        }
    }, [invoiceNumber, orderId, isAdmin]);

    // Auto-trigger print dialog when admin clicks Print Invoice
    useEffect(() => {
        if (autoPrint && invoice && !loading && !hasPrinted) {
            // Small delay to ensure page is fully rendered
            const timer = setTimeout(() => {
                window.print();
                setHasPrinted(true);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [autoPrint, invoice, loading, hasPrinted]);

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = async () => {
        if (!invoice?.invoiceNumber) return;

        try {
            const encodedInvoice = encodeURIComponent(invoice.invoiceNumber);
            const pdfUrl = `/api/invoice/pdf?invoice=${encodedInvoice}${isAdmin ? '&admin=true' : ''}`;

            const response = await fetch(pdfUrl);
            if (!response.ok) throw new Error('Failed to generate PDF');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Invoice-${invoice.invoiceNumber.replace(/\//g, '-')}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('PDF download error:', error);
            alert('Failed to download PDF. Please try again.');
        }
    };

    const handleRetryRefund = async () => {
        if (!invoice?.firestoreOrderId || !invoice?.cfOrderId) {
            alert('Cannot retry refund: Missing order information');
            return;
        }

        setRetryingRefund(true);
        try {
            const response = await fetch('/api/cashfree/refund', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: invoice.firestoreOrderId,
                    cfOrderId: invoice.cfOrderId,
                    refundAmount: invoice.grandTotal,
                    refundType: 'full',
                    reason: 'Refund retry from invoice',
                    initiatedBy: 'admin',
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert('Refund retry initiated successfully!');
                setInvoice(prev => prev ? {
                    ...prev,
                    refundStatus: 'processing',
                    refundTransactionId: data.cfRefundId,
                } : null);
            } else {
                alert(`Refund retry failed: ${data.details?.message || data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Refund retry error:', error);
            alert('Failed to retry refund. Please try again.');
        } finally {
            setRetryingRefund(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
        }).format(amount).replace('₹', '₹ ');
    };

    const getRefundStatusBadge = (status: string | undefined) => {
        switch (status) {
            case 'success':
            case 'completed':
                return { text: 'Refund Successful', color: 'bg-green-100 text-green-700 border-green-300', icon: FiCheck };
            case 'processing':
            case 'initiated':
                return { text: 'Processing', color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: FiClock };
            case 'failed':
                return { text: 'Failed', color: 'bg-red-100 text-red-700 border-red-300', icon: FiX };
            default:
                return { text: 'Not Initiated', color: 'bg-gray-100 text-gray-700 border-gray-300', icon: FiAlertCircle };
        }
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center bg-white ${autoPrint ? 'admin-print-mode' : ''}`}>
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading invoice...</p>
                </div>
                {/* Include the admin-print-mode styles in loading state */}
                {autoPrint && (
                    <style jsx global>{`
                        .admin-print-mode {
                            position: fixed !important;
                            top: 0 !important;
                            left: 0 !important;
                            right: 0 !important;
                            bottom: 0 !important;
                            z-index: 9999 !important;
                            background: white !important;
                        }
                        body:has(.admin-print-mode) header,
                        body:has(.admin-print-mode) nav,
                        body:has(.admin-print-mode) footer,
                        body:has(.admin-print-mode) .navbar,
                        body:has(.admin-print-mode) .site-header,
                        body:has(.admin-print-mode) .site-footer {
                            display: none !important;
                        }
                    `}</style>
                )}
            </div>
        );
    }

    if (error || !invoice) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiX className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Invoice</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <Link href="/orders" className="text-blue-600 hover:underline">
                        ← Back to Orders
                    </Link>
                </div>
            </div>
        );
    }

    const isCancelled = invoice.orderStatus === 'cancelled';
    const refundBadge = getRefundStatusBadge(invoice.refundStatus);
    const RefundIcon = refundBadge.icon;

    return (
        <div className={`min-h-screen bg-gray-100 py-6 print:py-0 print:bg-white ${autoPrint ? 'admin-print-mode' : ''}`}>
            {/* Action Bar - Hidden in print and when autoPrint is true */}
            {!autoPrint && (
                <div className="max-w-[210mm] mx-auto mb-6 px-4 print:hidden">
                    <div className="flex items-center justify-between bg-white rounded-lg shadow p-4">
                        <Link
                            href={isAdmin ? "/admindashboard/orders" : "/orders"}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                        >
                            <FiArrowLeft /> Back to Orders
                        </Link>
                        <div className="flex gap-4">
                            <button
                                onClick={handlePrint}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                <FiPrinter /> Print
                            </button>
                            <button
                                onClick={handleDownloadPDF}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                            >
                                <FiDownload /> Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Invoice Document - Full A4 Size */}
            <div
                id="invoice-document"
                ref={invoiceRef}
                className="a4-page bg-white shadow-lg print:shadow-none mx-auto"
            >
                {/* Header Section */}
                <div className="header-section">
                    <div className="company-block">
                        <h1 className="company-name">{invoice.company.name}</h1>
                        <p className="company-address">{invoice.company.address}</p>
                        <p className="company-contact">Phone: {invoice.company.phone}</p>
                        <p className="company-contact">{invoice.company.email}</p>
                        <p className="company-website">{invoice.company.website}</p>
                    </div>
                    <div className="qr-block">
                        <QRCodeSVG value="https://signaturecomputers.in" size={70} level="M" />
                        <span className="qr-label">Scan to visit</span>
                        {/* Show cancelled/refund status under QR for cancelled orders only - Single line */}
                        {isCancelled && isAdmin && (
                            <div className="qr-status-line">
                                ⛔ Cancelled | Refund: {
                                    invoice.refundStatus === 'success' || invoice.refundStatus === 'completed'
                                        ? '✓ Success'
                                        : invoice.refundStatus === 'processing' || invoice.refundStatus === 'initiated'
                                            ? '⏳ Processing'
                                            : '✗ Failed'
                                }
                            </div>
                        )}
                    </div>
                </div>

                {/* GSTIN Bar */}
                <div className="gstin-bar">
                    <div><strong>GSTIN:</strong> {invoice.company.gstin}</div>
                    <div className="text-center"><strong>State Code:</strong> {invoice.company.stateCode}</div>
                    <div className="text-right"><strong>PAN:</strong> {invoice.company.pan}</div>
                </div>

                {/* Billing & Invoice Info */}
                <div className="billing-row">
                    <div className="billed-to-section">
                        <h3 className="section-heading">Billed To</h3>
                        <p className="customer-name">{invoice.billedTo.name}</p>
                        <p className="customer-detail">{invoice.billedTo.addressLine1}</p>
                        {invoice.billedTo.addressLine2 && <p className="customer-detail">{invoice.billedTo.addressLine2}</p>}
                        <p className="customer-detail">{invoice.billedTo.city}, {invoice.billedTo.state} - {invoice.billedTo.pincode}</p>
                        <p className="customer-detail">Phone: {invoice.billedTo.phone}</p>
                        {invoice.billedTo.email && <p className="customer-detail">Email: {invoice.billedTo.email}</p>}
                    </div>
                    <div className="invoice-info-section">
                        <h2 className="invoice-title">TAX INVOICE</h2>
                        <div className="invoice-meta">
                            <div className="meta-line">
                                <span className="meta-label">Order ID:</span>
                                <span className="meta-value">{invoice.orderId}</span>
                            </div>
                            <div className="meta-line">
                                <span className="meta-label">Order Date:</span>
                                <span className="meta-value">{invoice.orderDateFormatted}</span>
                            </div>
                            <div className="meta-line">
                                <span className="meta-label">Invoice No:</span>
                                <span className="meta-value">{invoice.invoiceNumber}</span>
                            </div>
                            <div className="meta-line">
                                <span className="meta-label">Invoice Date:</span>
                                <span className="meta-value">{invoice.invoiceDateFormatted}</span>
                            </div>
                            <div className="meta-line payment-line">
                                <span className="meta-label">Payment:</span>
                                <span className="payment-value">{invoice.paymentMode}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products Table */}
                <table className="products-table">
                    <thead>
                        <tr>
                            <th className="col-sno">S.No</th>
                            <th className="col-part">Part No.</th>
                            <th className="col-desc">Description</th>
                            <th className="col-qty">Qty</th>
                            <th className="col-price">Unit Price</th>
                            <th className="col-amount">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.items.map((item, index) => (
                            <tr key={index}>
                                <td className="text-center">{item.sno}</td>
                                <td>
                                    {item.productId ? (
                                        <span className="part-no">{item.productId}</span>
                                    ) : (
                                        <span className="na-text">N/A</span>
                                    )}
                                </td>
                                <td>
                                    <div className="product-name">{item.description}</div>
                                    {item.warranty && <div className="warranty-text">✓ {item.warranty}</div>}
                                </td>
                                <td className="text-center">{item.quantity}</td>
                                <td className="text-right">{formatCurrency(item.unitPrice)}</td>
                                <td className="text-right font-semibold">{formatCurrency(item.amount)}</td>
                            </tr>
                        ))}
                        {/* Empty rows to fill space if less than 3 items */}
                        {invoice.items.length < 3 && [...Array(3 - invoice.items.length)].map((_, i) => (
                            <tr key={`empty-${i}`} className="empty-row">
                                <td>&nbsp;</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Totals Section with Amount in Words */}
                <div className="totals-row">
                    {/* Amount in Words - Left Side */}
                    <div className="amount-words-box">
                        <strong>Amount in Words:</strong>
                        <p>{invoice.amountInWords}</p>
                    </div>

                    {/* Totals - Right Side */}
                    <div className="totals-box">
                        <div className="total-line">
                            <span>Taxable Amount</span>
                            <span>{formatCurrency(invoice.taxableAmount)}</span>
                        </div>
                        {invoice.cgstAmount > 0 && (
                            <div className="total-line">
                                <span>CGST @ {invoice.cgstRate}%</span>
                                <span>{formatCurrency(invoice.cgstAmount)}</span>
                            </div>
                        )}
                        {invoice.sgstAmount > 0 && (
                            <div className="total-line">
                                <span>SGST @ {invoice.sgstRate}%</span>
                                <span>{formatCurrency(invoice.sgstAmount)}</span>
                            </div>
                        )}
                        {(invoice.igstAmount || 0) > 0 && (
                            <div className="total-line">
                                <span>IGST @ {invoice.igstRate}%</span>
                                <span>{formatCurrency(invoice.igstAmount || 0)}</span>
                            </div>
                        )}
                        <div className="grand-total-line">
                            <span>GRAND TOTAL</span>
                            <span>{formatCurrency(invoice.grandTotal)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="footer-section">
                    <div className="terms-block">
                        <h4 className="terms-title">Terms & Conditions:</h4>
                        <ol className="terms-list">
                            <li>For warranty claims, contact the respective brand&apos;s customer care directly.</li>
                            <li>Goods once sold will be accepted for warranty only if they are in good physical condition.</li>
                            <li>Returns require a valid RMA (Return Material Authorization) from Signature Computers.</li>
                            <li>All disputes are subject to Chennai jurisdiction.</li>
                        </ol>
                    </div>
                    <div className="signature-block">
                        <p className="signature-label">For Signature Computers</p>
                        <div className="signature-area">
                            {signatureUrl ? (
                                <img src={signatureUrl} alt="Signature" className="signature-img" />
                            ) : (
                                <div className="signature-line"></div>
                            )}
                        </div>
                        <p className="signatory-text">Authorised Signatory</p>
                    </div>
                </div>
            </div>

            {/* Invoice Styles - Full A4 Page */}
            <style jsx global>{`
                /* Admin Print Mode - Hide navbar and footer */
                .admin-print-mode {
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    right: 0 !important;
                    bottom: 0 !important;
                    z-index: 9999 !important;
                    background: white !important;
                    padding: 0 !important;
                    margin: 0 !important;
                    overflow: auto !important;
                }

                /* Hide navbar and footer in admin print mode */
                body:has(.admin-print-mode) header,
                body:has(.admin-print-mode) nav,
                body:has(.admin-print-mode) footer,
                body:has(.admin-print-mode) .navbar,
                body:has(.admin-print-mode) .site-header,
                body:has(.admin-print-mode) .site-footer {
                    display: none !important;
                }

                /* A4 Page Container */
                .a4-page {
                    width: 100%;
                    max-width: 210mm;
                    height: 297mm;
                    max-height: 297mm;
                    padding: 12mm 15mm;
                    font-family: 'Segoe UI', Arial, sans-serif;
                    font-size: 11px;
                    color: #1f2937;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    box-sizing: border-box;
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

                /* Header Section */
                .header-section {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    padding-bottom: 15px;
                    border-bottom: 3px solid #1e3a5f;
                    margin-bottom: 10px;
                }

                .company-block {
                    flex: 1;
                }

                .company-name {
                    font-size: 24px;
                    font-weight: 700;
                    color: #1e3a5f;
                    margin-bottom: 8px;
                }

                .company-address {
                    font-size: 11px;
                    color: #4b5563;
                    margin-bottom: 3px;
                }

                .company-contact {
                    font-size: 11px;
                    color: #4b5563;
                    margin-bottom: 2px;
                }

                .company-website {
                    font-size: 11px;
                    color: #2563eb;
                }

                .qr-block {
                    text-align: center;
                }

                .qr-label {
                    display: block;
                    font-size: 9px;
                    color: #9ca3af;
                    margin-top: 4px;
                }

                /* Cancelled/Refund Status under QR - Single Line */
                .qr-status-line {
                    margin-top: 6px;
                    padding: 3px 8px;
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

                .billed-to-section {
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

                .invoice-info-section {
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

                .invoice-meta {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }

                .meta-line {
                    display: flex;
                    justify-content: space-between;
                    font-size: 11px;
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
                .products-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 15px;
                    flex-grow: 1;
                }

                .products-table th {
                    background: #1e3a5f;
                    color: white;
                    padding: 10px 8px;
                    font-size: 11px;
                    font-weight: 600;
                    text-align: left;
                }

                .products-table td {
                    padding: 12px 8px;
                    border-bottom: 1px solid #e5e7eb;
                    vertical-align: top;
                    font-size: 11px;
                }

                .products-table tr:nth-child(even) {
                    background: #f9fafb;
                }

                .col-sno { width: 40px; }
                .col-part { width: 100px; }
                .col-desc { }
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

                .warranty-text {
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
                    padding: 10px 15px;
                    font-size: 11px;
                    border: 1px solid #e5e7eb;
                    margin-right: 15px;
                }

                .amount-words-box p {
                    margin: 5px 0 0 0;
                    color: #4b5563;
                }

                .totals-box {
                    width: 220px;
                    min-width: 220px;
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

                .grand-total-line {
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
                }

                .refund-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .refund-label {
                    color: #6b7280;
                    font-size: 11px;
                }

                .refund-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    padding: 4px 10px;
                    border-radius: 4px;
                    font-size: 11px;
                    font-weight: 600;
                    border: 1px solid;
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

                .retry-refund-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    margin-top: 12px;
                    padding: 8px 16px;
                    background: #ea580c;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.2s;
                }

                .retry-refund-btn:hover {
                    background: #c2410c;
                }

                .retry-refund-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                /* Footer Section */
                .footer-section {
                    display: flex;
                    border-top: 2px solid #1e3a5f;
                    padding-top: 15px;
                    margin-top: auto;
                }

                .terms-block {
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

                .signature-block {
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
                    object-fit: contain;
                }

                .signature-line {
                    width: 120px;
                    border-bottom: 1px solid #9ca3af;
                }

                .signatory-text {
                    font-size: 11px;
                    font-weight: 600;
                    color: #1f2937;
                }

                /* PRINT STYLES */
                @media print {
                    @page {
                        size: A4;
                        margin: 0;
                    }

                    html, body {
                        width: 210mm !important;
                        height: 297mm !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        overflow: hidden !important;
                        background: white !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }

                    body * {
                        visibility: hidden;
                    }

                    #invoice-document,
                    #invoice-document * {
                        visibility: visible;
                    }

                    #invoice-document {
                        position: fixed !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 210mm !important;
                        height: 297mm !important;
                        max-height: 297mm !important;
                        margin: 0 !important;
                        padding: 12mm 15mm !important;
                        box-shadow: none !important;
                        overflow: hidden !important;
                        box-sizing: border-box !important;
                    }

                    .print\\:hidden {
                        display: none !important;
                    }

                    /* Prevent any page breaks for first 3 items */
                    .products-table {
                        page-break-inside: avoid;
                    }

                    .footer-section {
                        page-break-inside: avoid;
                    }
                }

                /* Screen preview */
                @media screen {
                    .a4-page {
                        margin: 0 auto;
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                    }
                }
            `}</style>
        </div>
    );
}

export default function InvoiceViewPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <InvoiceViewContent />
        </Suspense>
    );
}
