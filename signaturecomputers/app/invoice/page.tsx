'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { FiDownload, FiPrinter, FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';

interface InvoiceData {
    invoiceNumber: string;
    orderId: string;
    cfOrderId?: string;
    invoiceDateFormatted: string;
    company: {
        name: string;
        address: string;
        phone: string;
        mobile: string;
        email: string;
        website: string;
        gstin: string;
        pan: string;
        stateCode: string;
        bankName: string;
        bankBranch: string;
        accountNumber: string;
        ifscCode: string;
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
        gstin?: string;
    };
    shippedTo: {
        name: string;
        addressLine1: string;
        addressLine2?: string;
        city: string;
        state: string;
        pincode: string;
        stateCode: string;
        phone: string;
    };
    termsOfDelivery: string;
    paymentMode: string;
    items: Array<{
        sno: number;
        description: string;
        partNumber?: string;
        hsnCode: string;
        quantity: number;
        unit: string;
        grossRate: number;
        discount: number;
        netRate: number;
        amount: number;
    }>;
    taxableAmount: number;
    cgstRate: number;
    cgstAmount: number;
    sgstRate: number;
    sgstAmount: number;
    igstRate?: number;
    igstAmount?: number;
    deliveryCharges: number;
    grandTotal: number;
    amountInWords: string;
}

function InvoiceViewContent() {
    const searchParams = useSearchParams();
    const invoiceNumber = searchParams.get('invoice');
    const orderId = searchParams.get('orderId');
    const [invoice, setInvoice] = useState<InvoiceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
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
        // For PDF download, we'll redirect to a PDF generation API
        const pdfUrl = `/api/invoice/pdf?invoice=${invoice?.invoiceNumber}`;
        window.open(pdfUrl, '_blank');
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
            <div className="max-w-4xl mx-auto mb-4 px-4 print:hidden">
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

            {/* Invoice Document */}
            <div
                ref={invoiceRef}
                className="max-w-4xl mx-auto bg-white shadow-lg print:shadow-none print:max-w-none"
                style={{ fontFamily: 'Arial, sans-serif' }}
            >
                {/* Header */}
                <div className="border-b-2 border-gray-800 p-6">
                    <div className="flex justify-between items-start">
                        {/* Phone numbers */}
                        <div className="text-sm text-gray-600">
                            <p>Ph: {invoice.company.phone}</p>
                            <p>Mob: {invoice.company.mobile}</p>
                        </div>

                        {/* Company Name and Logo */}
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-4 mb-2">
                                {/* Logo placeholder - you can replace with actual logo */}
                                <div className="w-16 h-16 border-2 border-gray-800 rounded-full flex items-center justify-center italic text-sm">
                                    <span className="font-script">Signature<br />Computers</span>
                                </div>
                                <h1 className="text-2xl font-bold tracking-wide">SIGNATURE COMPUTERS</h1>
                                {/* QR Code placeholder */}
                                <div className="w-16 h-16 border border-gray-400 flex items-center justify-center text-xs text-gray-400">
                                    QR
                                </div>
                            </div>
                            <p className="text-sm">{invoice.company.address}</p>
                            <p className="text-sm">{invoice.company.email}</p>
                            <p className="text-sm text-blue-600">{invoice.company.website}</p>
                        </div>

                        {/* Triplicate label */}
                        <div className="text-sm text-gray-500 text-right">
                            <p>(TRIPLICATE FOR SUPPLIER)</p>
                        </div>
                    </div>
                </div>

                {/* GSTIN and Invoice Info */}
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

                {/* Billed To / Shipped To / Tax Invoice */}
                <div className="grid grid-cols-3 border-b border-gray-400 text-sm">
                    {/* Billed To */}
                    <div className="p-3 border-r border-gray-400">
                        <p className="font-bold mb-2">Billed To</p>
                        <p className="font-semibold">{invoice.billedTo.name}</p>
                        <p>{invoice.billedTo.addressLine1}</p>
                        {invoice.billedTo.addressLine2 && <p>{invoice.billedTo.addressLine2}</p>}
                        <p>{invoice.billedTo.city} - {invoice.billedTo.pincode}</p>
                        <p>Contact: {invoice.billedTo.phone}</p>
                        <p className="mt-2"><strong>Phone No:</strong></p>
                        <p><strong>GSTIN:</strong> {invoice.billedTo.gstin || '-'}</p>
                        <p><strong>State Code:</strong> {invoice.billedTo.stateCode || '-'}</p>
                    </div>

                    {/* Shipped To */}
                    <div className="p-3 border-r border-gray-400">
                        <p className="font-bold mb-2">Ship To</p>
                        <p className="font-semibold">{invoice.shippedTo.name}</p>
                        <p>{invoice.shippedTo.addressLine1}</p>
                        {invoice.shippedTo.addressLine2 && <p>{invoice.shippedTo.addressLine2}</p>}
                        <p>{invoice.shippedTo.city} - {invoice.shippedTo.pincode}</p>
                        <p>Contact: {invoice.shippedTo.phone}</p>
                        <p className="mt-2"><strong>Phone No:</strong></p>
                        <p><strong>GSTIN:</strong> -</p>
                        <p><strong>State Code:</strong> {invoice.shippedTo.stateCode || '-'}</p>
                    </div>

                    {/* Tax Invoice Details */}
                    <div className="p-3">
                        <p className="font-bold text-center text-lg mb-3">TAX INVOICE</p>
                        <div className="space-y-1">
                            <div className="flex justify-between">
                                <span><strong>No:</strong></span>
                                <span>{invoice.invoiceNumber}</span>
                            </div>
                            <div className="flex justify-between">
                                <span><strong>Date:</strong></span>
                                <span>{invoice.invoiceDateFormatted}</span>
                            </div>
                            <div className="flex justify-between">
                                <span><strong>IRN:</strong></span>
                                <span className="text-xs">-</span>
                            </div>
                            <div className="flex justify-between">
                                <span><strong>EWay Bill No:</strong></span>
                                <span>-</span>
                            </div>
                            <div className="flex justify-between">
                                <span><strong>Vehicle No:</strong></span>
                                <span>-</span>
                            </div>
                            <div className="flex justify-between">
                                <span><strong>Ack No:</strong></span>
                                <span>-</span>
                            </div>
                        </div>
                        <div className="mt-3 pt-2 border-t border-gray-300">
                            <p><strong>Terms of Delivery:</strong> {invoice.termsOfDelivery}</p>
                        </div>
                    </div>
                </div>

                {/* Order Reference */}
                <div className="grid grid-cols-2 border-b border-gray-400 text-sm">
                    <div className="p-2 border-r border-gray-400">
                        <p><strong>Ref Name & Date:</strong> & {invoice.invoiceDateFormatted}</p>
                    </div>
                    <div className="p-2">
                        <p><strong>Mode/Terms of Payment:</strong> {invoice.paymentMode}</p>
                    </div>
                </div>

                {/* Items Table */}
                <table className="w-full text-sm border-collapse">
                    <thead>
                        <tr className="bg-gray-100 border-b border-gray-400">
                            <th className="border-r border-gray-400 p-2 text-left">S.no</th>
                            <th className="border-r border-gray-400 p-2 text-left">Description</th>
                            <th className="border-r border-gray-400 p-2 text-center">HSN Code</th>
                            <th className="border-r border-gray-400 p-2 text-center">Pcs</th>
                            <th className="border-r border-gray-400 p-2 text-center">Unit</th>
                            <th className="border-r border-gray-400 p-2 text-right">Grs Rate/Unit</th>
                            <th className="border-r border-gray-400 p-2 text-center">Disc%</th>
                            <th className="border-r border-gray-400 p-2 text-right">Net Rate/Unit</th>
                            <th className="p-2 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.items.map((item, index) => (
                            <tr key={index} className="border-b border-gray-300">
                                <td className="border-r border-gray-300 p-2">{item.sno}</td>
                                <td className="border-r border-gray-300 p-2">
                                    <p className="font-semibold">{item.description}</p>
                                    {item.partNumber && (
                                        <p className="text-xs text-gray-500">{item.partNumber}</p>
                                    )}
                                </td>
                                <td className="border-r border-gray-300 p-2 text-center">{item.hsnCode}</td>
                                <td className="border-r border-gray-300 p-2 text-center">{item.quantity}</td>
                                <td className="border-r border-gray-300 p-2 text-center">{item.unit}</td>
                                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(item.grossRate)}</td>
                                <td className="border-r border-gray-300 p-2 text-center">{item.discount}</td>
                                <td className="border-r border-gray-300 p-2 text-right">{formatCurrency(item.netRate)}</td>
                                <td className="p-2 text-right">{formatCurrency(item.amount)}</td>
                            </tr>
                        ))}
                        {/* Empty rows for spacing */}
                        <tr className="h-20 border-b border-gray-300">
                            <td colSpan={9}></td>
                        </tr>
                    </tbody>
                </table>

                {/* Bank Details and Total */}
                <div className="grid grid-cols-2 border-t border-gray-400">
                    {/* Bank Details */}
                    <div className="p-3 border-r border-gray-400 text-sm">
                        <table className="w-full">
                            <tbody>
                                <tr>
                                    <td className="py-1"><strong>Bank Name</strong></td>
                                    <td>: {invoice.company.bankName}</td>
                                </tr>
                                <tr>
                                    <td className="py-1"><strong>Branch</strong></td>
                                    <td>: {invoice.company.bankBranch}</td>
                                </tr>
                                <tr>
                                    <td className="py-1"><strong>A/C No.</strong></td>
                                    <td>: {invoice.company.accountNumber}</td>
                                </tr>
                                <tr>
                                    <td className="py-1"><strong>IFSC Code</strong></td>
                                    <td>: {invoice.company.ifscCode}</td>
                                </tr>
                            </tbody>
                        </table>

                        {/* QR Code placeholder for UPI */}
                        <div className="mt-4 flex justify-center">
                            <div className="w-24 h-24 border border-gray-400 flex items-center justify-center text-xs text-gray-400">
                                UPI QR
                            </div>
                        </div>
                    </div>

                    {/* Totals */}
                    <div className="p-3 text-sm">
                        <table className="w-full">
                            <tbody>
                                <tr>
                                    <td className="py-1 text-right pr-4"><strong>Total</strong></td>
                                    <td className="py-1 text-right font-bold">{formatCurrency(invoice.taxableAmount)}</td>
                                </tr>
                                <tr className="border-t border-gray-300">
                                    <td className="py-1 text-right pr-4">Taxable Amount</td>
                                    <td className="py-1 text-right">{formatCurrency(invoice.taxableAmount)}</td>
                                </tr>
                                {invoice.cgstAmount > 0 && (
                                    <tr>
                                        <td className="py-1 text-right pr-4">Output CGST {invoice.cgstRate}%</td>
                                        <td className="py-1 text-right">{formatCurrency(invoice.cgstAmount)}</td>
                                    </tr>
                                )}
                                {invoice.sgstAmount > 0 && (
                                    <tr>
                                        <td className="py-1 text-right pr-4">Output SGST {invoice.sgstRate}%</td>
                                        <td className="py-1 text-right">{formatCurrency(invoice.sgstAmount)}</td>
                                    </tr>
                                )}
                                {(invoice.igstAmount || 0) > 0 && (
                                    <tr>
                                        <td className="py-1 text-right pr-4">IGST {invoice.igstRate}%</td>
                                        <td className="py-1 text-right">{formatCurrency(invoice.igstAmount || 0)}</td>
                                    </tr>
                                )}
                                {invoice.deliveryCharges > 0 && (
                                    <tr>
                                        <td className="py-1 text-right pr-4">Delivery Charges -S</td>
                                        <td className="py-1 text-right">{formatCurrency(invoice.deliveryCharges)}</td>
                                    </tr>
                                )}
                                <tr className="border-t-2 border-gray-800">
                                    <td className="py-2 text-right pr-4"><strong>GRAND TOTAL</strong></td>
                                    <td className="py-2 text-right font-bold text-lg">{formatCurrency(invoice.grandTotal)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Amount in Words and Terms */}
                <div className="border-t border-gray-400 p-4 text-sm">
                    <p className="font-bold mb-4">({invoice.amountInWords})</p>

                    <div className="grid grid-cols-2 gap-8">
                        <div className="text-xs text-gray-600 space-y-1">
                            <p>a. Cheque/Draft will be in favour of Signature Computers</p>
                            <p>b. After Sales for Service or Replacement or Warranty call directly customer care of respective Vendors</p>
                            <p>c. Warranty in respective of any products accordance</p>
                            <p>d. Goods sold will be accepted for warranty/ repair/ replacement only if they are in good physical condition</p>
                            <p>e. Goods once sold cannot be returned without a valid RMA( Returned Materials Authorization) issued by Signature computers</p>
                            <p>f. All disputes are subject to chennai Jurisdiction</p>
                        </div>

                        <div className="text-right">
                            <p className="mb-8">For Signature Computers</p>
                            <div className="flex justify-end items-center gap-4">
                                {/* Signature placeholder */}
                                <div className="w-20 h-12 border-b border-gray-400"></div>
                                {/* Company seal placeholder */}
                                <div className="w-16 h-16 rounded-full border-2 border-gray-400 flex items-center justify-center text-xs text-gray-400">
                                    SEAL
                                </div>
                            </div>
                            <p className="mt-2 font-semibold">Authorised Signatory</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    body {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                    .print\\:shadow-none {
                        box-shadow: none !important;
                    }
                    .print\\:max-w-none {
                        max-width: none !important;
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
