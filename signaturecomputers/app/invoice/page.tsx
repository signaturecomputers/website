'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { FiDownload, FiPrinter, FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';

interface InvoiceData {
    invoiceNumber: string;
    orderId: string;
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
}

function InvoiceViewContent() {
    const searchParams = useSearchParams();
    const invoiceNumber = searchParams.get('invoice');
    const orderId = searchParams.get('orderId');
    const [invoice, setInvoice] = useState<InvoiceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
    const invoiceRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function fetchInvoice() {
            try {
                // If we have an invoice number, fetch it directly
                // If we have an order ID, generate invoice first
                const endpoint = invoiceNumber
                    ? `/api/invoice/get?invoice=${invoiceNumber}`
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

                setInvoice(data.invoiceData);

                // Fetch admin signature if available
                try {
                    const signatureRes = await fetch('/api/admin/signature');
                    if (signatureRes.ok) {
                        const sigData = await signatureRes.json();
                        if (sigData.signatureUrl) {
                            setSignatureUrl(sigData.signatureUrl);
                        }
                    }
                } catch {
                    // Signature is optional, continue without it
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
    }, [invoiceNumber, orderId]);

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = async () => {
        if (!invoice?.invoiceNumber) return;

        try {
            // Encode the invoice number for URL
            const encodedInvoice = encodeURIComponent(invoice.invoiceNumber);
            const pdfUrl = `/api/invoice/pdf?invoice=${encodedInvoice}`;

            // Fetch the PDF and trigger download
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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
        }).format(amount).replace('₹', '₹ ');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading invoice...</p>
                </div>
            </div>
        );
    }

    if (error || !invoice) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
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

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            {/* Action Bar - Hidden in print */}
            <div className="max-w-4xl mx-auto mb-4 px-4 print-hidden">
                <div className="flex items-center justify-between bg-white rounded-lg shadow p-4">
                    <Link
                        href="/orders"
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

            {/* Invoice Document - Modern Clean Design */}
            <div
                id="invoice-document"
                ref={invoiceRef}
                className="max-w-4xl mx-auto bg-white shadow-lg"
                style={{ fontFamily: 'Arial, sans-serif' }}
            >
                {/* Header - Clean, Modern */}
                <div className="border-b-2 border-gray-800 p-6">
                    <div className="flex justify-between items-start">
                        {/* Company Name and Details */}
                        <div>
                            <h1 className="text-2xl font-bold tracking-wide mb-2">{invoice.company.name}</h1>
                            <p className="text-sm text-gray-600">{invoice.company.address}</p>
                            <p className="text-sm text-gray-600">Phone: {invoice.company.phone}</p>
                            <p className="text-sm text-gray-600">{invoice.company.email}</p>
                            <p className="text-sm text-blue-600">{invoice.company.website}</p>
                        </div>

                        {/* QR Code - Scan to visit website */}
                        <div className="text-center">
                            <QRCodeSVG
                                value="https://signaturecomputers.in"
                                size={80}
                                level="M"
                            />
                            <p className="text-xs text-gray-500 mt-1">Scan to visit</p>
                        </div>
                    </div>
                </div>

                {/* GSTIN and PAN */}
                <div className="grid grid-cols-3 border-b border-gray-400 text-sm">
                    <div className="p-3 border-r border-gray-400">
                        <p><strong>GSTIN:</strong> {invoice.company.gstin}</p>
                    </div>
                    <div className="p-3 border-r border-gray-400 text-center">
                        <p><strong>State Code:</strong> {invoice.company.stateCode}</p>
                    </div>
                    <div className="p-3 text-right">
                        <p><strong>PAN:</strong> {invoice.company.pan}</p>
                    </div>
                </div>

                {/* Tax Invoice Header & Meta Info */}
                <div className="grid grid-cols-2 border-b border-gray-400">
                    {/* Billed To */}
                    <div className="p-4 border-r border-gray-400">
                        <p className="font-bold text-lg mb-3 text-blue-800">Billed To</p>
                        <p className="font-semibold text-gray-800">{invoice.billedTo.name}</p>
                        <p className="text-sm text-gray-600">{invoice.billedTo.addressLine1}</p>
                        {invoice.billedTo.addressLine2 && <p className="text-sm text-gray-600">{invoice.billedTo.addressLine2}</p>}
                        <p className="text-sm text-gray-600">{invoice.billedTo.city}, {invoice.billedTo.state} - {invoice.billedTo.pincode}</p>
                        <p className="text-sm text-gray-600 mt-2">Phone: {invoice.billedTo.phone}</p>
                        {invoice.billedTo.email && <p className="text-sm text-gray-600">Email: {invoice.billedTo.email}</p>}
                    </div>

                    {/* Tax Invoice Details */}
                    <div className="p-4">
                        <p className="font-bold text-xl text-center mb-4 text-blue-800">TAX INVOICE</p>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Order ID:</span>
                                <span className="font-medium">{invoice.orderId}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Order Date:</span>
                                <span className="font-medium">{invoice.orderDateFormatted}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Invoice No:</span>
                                <span className="font-medium">{invoice.invoiceNumber}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Invoice Date:</span>
                                <span className="font-medium">{invoice.invoiceDateFormatted}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-gray-300">
                                <span className="text-gray-600">Mode of Payment:</span>
                                <span className="font-semibold text-green-700">{invoice.paymentMode}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Items Table - Clean, Simplified */}
                <table className="w-full text-sm border-collapse">
                    <thead>
                        <tr className="bg-gray-100 border-b border-gray-400">
                            <th className="border-r border-gray-400 p-3 text-left w-12">S.No</th>
                            <th className="border-r border-gray-400 p-3 text-left">Part No.</th>
                            <th className="border-r border-gray-400 p-3 text-left" style={{ width: '40%' }}>Description</th>
                            <th className="border-r border-gray-400 p-3 text-center w-16">Qty</th>
                            <th className="border-r border-gray-400 p-3 text-right">Unit Price<br /><span className="text-xs font-normal text-gray-500">(Incl. GST)</span></th>
                            <th className="p-3 text-right">Amount<br /><span className="text-xs font-normal text-gray-500">(Incl. GST)</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.items.map((item, index) => (
                            <tr key={index} className="border-b border-gray-300">
                                <td className="border-r border-gray-300 p-3 text-center">{item.sno}</td>
                                <td className="border-r border-gray-300 p-3">
                                    {item.productId ? (
                                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                            {item.productId}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400 text-xs">N/A</span>
                                    )}
                                </td>
                                <td className="border-r border-gray-300 p-3">
                                    <p className="font-semibold text-gray-800">{item.description}</p>
                                    {item.warranty && (
                                        <p className="text-xs text-green-700 mt-1 flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            {item.warranty}
                                        </p>
                                    )}
                                </td>
                                <td className="border-r border-gray-300 p-3 text-center">{item.quantity}</td>
                                <td className="border-r border-gray-300 p-3 text-right">{formatCurrency(item.unitPrice)}</td>
                                <td className="p-3 text-right font-medium">{formatCurrency(item.amount)}</td>
                            </tr>
                        ))}
                        {/* Spacing row */}
                        <tr className="h-16 border-b border-gray-300">
                            <td colSpan={6}></td>
                        </tr>
                    </tbody>
                </table>

                {/* Totals Section - Right Aligned */}
                <div className="border-t border-gray-400 p-4">
                    <div className="flex justify-end">
                        <div className="w-80">
                            <table className="w-full text-sm">
                                <tbody>
                                    <tr>
                                        <td className="py-1 text-right pr-4 text-gray-600">Taxable Amount</td>
                                        <td className="py-1 text-right font-medium">{formatCurrency(invoice.taxableAmount)}</td>
                                    </tr>
                                    {invoice.cgstAmount > 0 && (
                                        <tr>
                                            <td className="py-1 text-right pr-4 text-gray-600">CGST @ {invoice.cgstRate}%</td>
                                            <td className="py-1 text-right">{formatCurrency(invoice.cgstAmount)}</td>
                                        </tr>
                                    )}
                                    {invoice.sgstAmount > 0 && (
                                        <tr>
                                            <td className="py-1 text-right pr-4 text-gray-600">SGST @ {invoice.sgstRate}%</td>
                                            <td className="py-1 text-right">{formatCurrency(invoice.sgstAmount)}</td>
                                        </tr>
                                    )}
                                    {(invoice.igstAmount || 0) > 0 && (
                                        <tr>
                                            <td className="py-1 text-right pr-4 text-gray-600">IGST @ {invoice.igstRate}%</td>
                                            <td className="py-1 text-right">{formatCurrency(invoice.igstAmount || 0)}</td>
                                        </tr>
                                    )}
                                    <tr className="border-t-2 border-gray-800">
                                        <td className="py-3 text-right pr-4 font-bold text-lg">GRAND TOTAL</td>
                                        <td className="py-3 text-right font-bold text-xl text-blue-800">{formatCurrency(invoice.grandTotal)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Amount in Words */}
                <div className="border-t border-gray-400 px-4 py-3 bg-gray-50">
                    <p className="text-sm"><strong>Amount in Words:</strong> {invoice.amountInWords}</p>
                </div>

                {/* Footer - Terms and Signature */}
                <div className="border-t border-gray-400 p-4">
                    <div className="grid grid-cols-2 gap-8">
                        {/* Terms & Conditions */}
                        <div className="text-xs text-gray-600 space-y-1">
                            <p className="font-semibold text-gray-800 mb-2">Terms & Conditions:</p>
                            <p>1. For warranty claims, contact the respective brand's customer care directly.</p>
                            <p>2. Goods once sold will be accepted for warranty only if they are in good physical condition.</p>
                            <p>3. Returns require a valid RMA (Return Material Authorization) from Signature Computers.</p>
                            <p>4. All disputes are subject to Chennai jurisdiction.</p>
                        </div>

                        {/* Authorized Signature */}
                        <div className="text-right">
                            <p className="mb-2 font-medium">For Signature Computers</p>
                            <div className="h-16 flex justify-end items-end">
                                {signatureUrl ? (
                                    <img
                                        src={signatureUrl}
                                        alt="Authorized Signature"
                                        className="h-12 object-contain"
                                    />
                                ) : (
                                    <div className="w-32 border-b border-gray-400"></div>
                                )}
                            </div>
                            <p className="mt-2 font-semibold text-sm">Authorised Signatory</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Styles - Only print the invoice, hide everything else */}
            <style jsx global>{`
                @media print {
                    /* Hide everything by default */
                    body * {
                        visibility: hidden;
                    }
                    
                    /* Show only the invoice and its contents */
                    #invoice-document,
                    #invoice-document * {
                        visibility: visible;
                    }
                    
                    /* Position the invoice at the top of the page */
                    #invoice-document {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        max-width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        box-shadow: none !important;
                    }
                    
                    /* Ensure colors print correctly */
                    body {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    
                    /* Hide action bar explicitly */
                    .print-hidden {
                        display: none !important;
                    }
                    
                    /* Remove any background from body */
                    body {
                        background: white !important;
                    }
                    
                    /* Page setup */
                    @page {
                        size: A4;
                        margin: 10mm;
                    }
                }
                
                /* Prevent text selection on invoice to discourage copying */
                #invoice-document {
                    -webkit-user-select: none;
                    -moz-user-select: none;
                    -ms-user-select: none;
                    user-select: none;
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
