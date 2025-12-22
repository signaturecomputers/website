'use client';

import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
    FiSearch, FiFilter, FiCheck, FiX, FiRefreshCw, FiDollarSign,
    FiClock, FiAlertCircle, FiPackage, FiTruck, FiChevronDown,
    FiUser, FiPhone, FiMail
} from 'react-icons/fi';
import { toast } from 'sonner';

interface RefundRequest {
    id: string;
    type: 'cancellation' | 'return';
    orderId: string;
    customerId: string;
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    productName: string;
    orderAmount: number;
    reason: string;
    comments?: string;
    status: string;
    requestedAt: any;
    processedAt?: any;
    processedBy?: string;
    adminNotes?: string;
    // For returns
    images?: string[];
    pickupDate?: string;
}

interface RefundRecord {
    id: string;
    orderId: string;
    cfOrderId?: string;
    cfRefundId?: string;
    refundAmount: number;
    refundType: 'full' | 'partial';
    reason: string;
    status: string;
    initiatedBy: string;
    initiatedAt: any;
    completedAt?: any;
}

export default function RefundsPage() {
    const [activeTab, setActiveTab] = useState<'cancellations' | 'returns' | 'refunds'>('cancellations');
    const [cancellations, setCancellations] = useState<RefundRequest[]>([]);
    const [returns, setReturns] = useState<RefundRequest[]>([]);
    const [refunds, setRefunds] = useState<RefundRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/refund-requests?type=${activeTab}`);
            const result = await response.json();

            if (response.ok) {
                if (activeTab === 'cancellations') {
                    setCancellations(result.data || []);
                } else if (activeTab === 'returns') {
                    setReturns(result.data || []);
                } else {
                    setRefunds(result.data || []);
                }
            } else {
                console.error('Error fetching data:', result.error);
                toast.error(result.error || 'Failed to fetch data');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (request: RefundRequest) => {
        setProcessingId(request.id);
        try {
            const collectionName = request.type === 'cancellation'
                ? 'cancellation_requests'
                : 'return_requests';

            // First, get the order to check payment status
            const orderSnapshot = await getDocs(
                query(collection(db, 'orders'), where('orderId', '==', request.orderId))
            );

            let orderData: any = null;
            let orderDocId = request.orderId;

            if (!orderSnapshot.empty) {
                orderDocId = orderSnapshot.docs[0].id;
                orderData = orderSnapshot.docs[0].data();
            }

            // Update request status to approved
            await updateDoc(doc(db, collectionName, request.id), {
                status: 'approved',
                processedAt: new Date(),
                processedBy: 'admin',
            });

            // Update order status to cancelled
            await updateDoc(doc(db, 'orders', orderDocId), {
                status: request.type === 'cancellation' ? 'cancelled' : 'return_approved',
                updatedAt: new Date(),
            });

            // If the order was PAID (online payment), automatically initiate refund
            if (orderData && orderData.paymentStatus === 'paid' && orderData.cfOrderId) {
                toast.info('Order was paid online. Initiating automatic refund...');

                try {
                    const refundResponse = await fetch('/api/cashfree/refund', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            orderId: orderDocId,
                            cfOrderId: orderData.cfOrderId,
                            refundAmount: request.orderAmount,
                            refundType: 'full',
                            reason: request.reason,
                            initiatedBy: 'admin',
                        }),
                    });

                    const refundData = await refundResponse.json();

                    if (refundResponse.ok) {
                        // Update cancellation/return request with refund info
                        await updateDoc(doc(db, collectionName, request.id), {
                            status: 'refund_initiated',
                            refundId: refundData.refundId,
                            refundStatus: refundData.status || 'initiated',
                            updatedAt: new Date(),
                        });

                        // Update order with refund info
                        await updateDoc(doc(db, 'orders', orderDocId), {
                            status: 'refund_initiated',
                            refundId: refundData.refundId,
                            refundStatus: refundData.status || 'initiated',
                            refundAmount: request.orderAmount,
                            updatedAt: new Date(),
                        });

                        // Send refund notification email
                        await fetch('/api/email/send', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                type: 'refund',
                                data: {
                                    orderId: request.orderId,
                                    customerName: request.customerName,
                                    customerEmail: request.customerEmail,
                                    refundAmount: request.orderAmount,
                                    refundStatus: 'initiated',
                                    refundId: refundData.refundId,
                                },
                            }),
                        });

                        toast.success(`${request.type === 'cancellation' ? 'Cancellation' : 'Return'} approved & refund initiated!`);
                    } else {
                        toast.error(`Approved but refund failed: ${refundData.error}`);
                    }
                } catch (refundError) {
                    console.error('Refund initiation error:', refundError);
                    toast.error('Approved but automatic refund failed. Please initiate manually.');
                }
            } else if (orderData &&
                (orderData.paymentMethod === 'COD' || orderData.paymentStatus === 'pending')) {
                // COD order - no payment was made, just mark as cancelled
                await updateDoc(doc(db, 'orders', orderDocId), {
                    status: 'cancelled',
                    refundStatus: 'not_applicable',
                    updatedAt: new Date(),
                });
                toast.success(`${request.type === 'cancellation' ? 'Cancellation' : 'Return'} approved! (No refund needed - COD/Unpaid order)`);
            } else {
                toast.success(`${request.type === 'cancellation' ? 'Cancellation' : 'Return'} approved`);
            }

            fetchData();
        } catch (error) {
            console.error('Error approving request:', error);
            toast.error('Failed to approve request');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (request: RefundRequest, notes: string) => {
        setProcessingId(request.id);
        try {
            const collectionName = request.type === 'cancellation'
                ? 'cancellation_requests'
                : 'return_requests';

            await updateDoc(doc(db, collectionName, request.id), {
                status: 'rejected',
                processedAt: new Date(),
                processedBy: 'admin',
                adminNotes: notes,
            });

            // Revert order status
            await updateDoc(doc(db, 'orders', request.orderId), {
                status: request.type === 'cancellation' ? 'confirmed' : 'delivered',
                updatedAt: new Date(),
            });

            toast.success(`${request.type === 'cancellation' ? 'Cancellation' : 'Return'} rejected`);
            fetchData();
        } catch (error) {
            console.error('Error rejecting request:', error);
            toast.error('Failed to reject request');
        } finally {
            setProcessingId(null);
        }
    };

    const initiateRefund = async (request: RefundRequest) => {
        setProcessingId(request.id);
        try {
            // Find the order to get cfOrderId
            const orderSnapshot = await getDocs(
                query(collection(db, 'orders'), where('orderId', '==', request.orderId))
            );

            if (orderSnapshot.empty) {
                // Try by document ID
                toast.error('Order not found');
                return;
            }

            const orderDoc = orderSnapshot.docs[0];
            const orderData = orderDoc.data();

            const response = await fetch('/api/cashfree/refund', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: orderDoc.id,
                    cfOrderId: orderData.cfOrderId,
                    refundAmount: request.orderAmount,
                    refundType: 'full',
                    reason: request.reason,
                    initiatedBy: 'admin',
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Update request with refund info
                const collectionName = request.type === 'cancellation'
                    ? 'cancellation_requests'
                    : 'return_requests';

                await updateDoc(doc(db, collectionName, request.id), {
                    status: 'refund_initiated',
                    refundId: data.refundId,
                    updatedAt: new Date(),
                });

                // Send refund notification email
                await fetch('/api/email/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'refund',
                        data: {
                            orderId: request.orderId,
                            customerName: request.customerName,
                            customerEmail: request.customerEmail,
                            refundAmount: request.orderAmount,
                            refundStatus: 'initiated',
                            refundId: data.refundId,
                        },
                    }),
                });

                toast.success('Refund initiated successfully');
                fetchData();
            } else {
                toast.error(data.error || 'Failed to initiate refund');
            }
        } catch (error) {
            console.error('Error initiating refund:', error);
            toast.error('Failed to initiate refund');
        } finally {
            setProcessingId(null);
        }
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return '-';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatCurrency = (amount: number) => {
        return `₹${amount.toLocaleString('en-IN')}`;
    };

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: <FiClock /> },
            approved: { bg: 'bg-green-100', text: 'text-green-700', icon: <FiCheck /> },
            rejected: { bg: 'bg-red-100', text: 'text-red-700', icon: <FiX /> },
            refund_initiated: { bg: 'bg-blue-100', text: 'text-blue-700', icon: <FiRefreshCw /> },
            processing: { bg: 'bg-purple-100', text: 'text-purple-700', icon: <FiRefreshCw className="animate-spin" /> },
            completed: { bg: 'bg-green-100', text: 'text-green-700', icon: <FiCheck /> },
            failed: { bg: 'bg-red-100', text: 'text-red-700', icon: <FiAlertCircle /> },
            initiated: { bg: 'bg-blue-100', text: 'text-blue-700', icon: <FiClock /> },
        };

        const config = statusConfig[status] || statusConfig.pending;

        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                {config.icon}
                {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
            </span>
        );
    };

    const filteredCancellations = cancellations.filter(c => {
        const matchesSearch = c.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.productName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const filteredReturns = returns.filter(r => {
        const matchesSearch = r.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.productName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const filteredRefunds = refunds.filter(r => {
        const matchesSearch = r.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.cfRefundId?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const pendingCancellations = cancellations.filter(c => c.status === 'pending').length;
    const pendingReturns = returns.filter(r => r.status === 'pending').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Refunds & Returns
                </h1>
                <button
                    onClick={fetchData}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                    <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b dark:border-gray-700">
                <button
                    onClick={() => { setActiveTab('cancellations'); setFilterStatus('all'); }}
                    className={`px-4 py-3 font-medium relative ${activeTab === 'cancellations'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Cancellations
                    {pendingCancellations > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                            {pendingCancellations}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => { setActiveTab('returns'); setFilterStatus('all'); }}
                    className={`px-4 py-3 font-medium relative ${activeTab === 'returns'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Returns
                    {pendingReturns > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                            {pendingReturns}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => { setActiveTab('refunds'); setFilterStatus('all'); }}
                    className={`px-4 py-3 font-medium ${activeTab === 'refunds'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Refund History
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-4 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by order ID, customer, or product..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="refund_initiated">Refund Initiated</option>
                    {activeTab === 'refunds' && (
                        <>
                            <option value="processing">Processing</option>
                            <option value="completed">Completed</option>
                            <option value="failed">Failed</option>
                        </>
                    )}
                </select>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
                    {/* Cancellations Table */}
                    {activeTab === 'cancellations' && (
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-900">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y dark:divide-gray-700">
                                {filteredCancellations.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                                            No cancellation requests found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCancellations.map((request) => (
                                        <React.Fragment key={request.id}>
                                            <tr
                                                className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                                                onClick={() => setExpandedRow(expandedRow === request.id ? null : request.id)}
                                            >
                                                <td className="px-4 py-3 text-sm font-mono">{request.id.slice(0, 12)}...</td>
                                                <td className="px-4 py-3 text-sm">
                                                    <span className="font-medium">{request.orderId}</span>
                                                    <br />
                                                    <span className="text-xs text-gray-500">{request.productName?.slice(0, 25)}...</span>
                                                </td>
                                                <td className="px-4 py-3 text-sm">{request.customerName}</td>
                                                <td className="px-4 py-3 text-sm font-medium">{formatCurrency(request.orderAmount)}</td>
                                                <td className="px-4 py-3 text-sm max-w-[150px] truncate">{request.reason}</td>
                                                <td className="px-4 py-3">{getStatusBadge(request.status)}</td>
                                                <td className="px-4 py-3 text-sm text-gray-500">{formatDate(request.requestedAt)}</td>
                                                <td className="px-4 py-3">
                                                    {request.status === 'pending' && (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleApprove(request); }}
                                                                disabled={processingId === request.id}
                                                                className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 disabled:opacity-50"
                                                            >
                                                                <FiCheck />
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const notes = prompt('Enter rejection reason:');
                                                                    if (notes) handleReject(request, notes);
                                                                }}
                                                                disabled={processingId === request.id}
                                                                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 disabled:opacity-50"
                                                            >
                                                                <FiX />
                                                            </button>
                                                        </div>
                                                    )}
                                                    {request.status === 'approved' && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); initiateRefund(request); }}
                                                            disabled={processingId === request.id}
                                                            className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 disabled:opacity-50 text-sm"
                                                        >
                                                            <FiDollarSign />
                                                            Refund
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                            {expandedRow === request.id && (
                                                <tr className="bg-gray-50 dark:bg-gray-900">
                                                    <td colSpan={8} className="px-4 py-4">
                                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                                            <div>
                                                                <p className="text-gray-500 mb-1">Customer Details</p>
                                                                <p className="flex items-center gap-2"><FiUser /> {request.customerName}</p>
                                                                <p className="flex items-center gap-2"><FiMail /> {request.customerEmail || '-'}</p>
                                                                <p className="flex items-center gap-2"><FiPhone /> {request.customerPhone || '-'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-500 mb-1">Reason Details</p>
                                                                <p className="font-medium">{request.reason}</p>
                                                                {request.comments && <p className="text-gray-600 mt-1">{request.comments}</p>}
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-500 mb-1">Processing Info</p>
                                                                {request.processedAt && <p>Processed: {formatDate(request.processedAt)}</p>}
                                                                {request.adminNotes && <p className="text-gray-600">Notes: {request.adminNotes}</p>}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}

                    {/* Returns Table */}
                    {activeTab === 'returns' && (
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-900">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Return ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y dark:divide-gray-700">
                                {filteredReturns.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                                            No return requests found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredReturns.map((request) => (
                                        <React.Fragment key={request.id}>
                                            <tr
                                                className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                                                onClick={() => setExpandedRow(expandedRow === request.id ? null : request.id)}
                                            >
                                                <td className="px-4 py-3 text-sm font-mono">{request.id.slice(0, 12)}...</td>
                                                <td className="px-4 py-3 text-sm">
                                                    <span className="font-medium">{request.orderId}</span>
                                                    <br />
                                                    <span className="text-xs text-gray-500">{request.productName?.slice(0, 25)}...</span>
                                                </td>
                                                <td className="px-4 py-3 text-sm">{request.customerName}</td>
                                                <td className="px-4 py-3 text-sm font-medium">{formatCurrency(request.orderAmount)}</td>
                                                <td className="px-4 py-3 text-sm max-w-[150px] truncate">{request.reason}</td>
                                                <td className="px-4 py-3">{getStatusBadge(request.status)}</td>
                                                <td className="px-4 py-3 text-sm text-gray-500">{formatDate(request.requestedAt)}</td>
                                                <td className="px-4 py-3">
                                                    {request.status === 'pending' && (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleApprove(request); }}
                                                                disabled={processingId === request.id}
                                                                className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 disabled:opacity-50"
                                                            >
                                                                <FiCheck />
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const notes = prompt('Enter rejection reason:');
                                                                    if (notes) handleReject(request, notes);
                                                                }}
                                                                disabled={processingId === request.id}
                                                                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 disabled:opacity-50"
                                                            >
                                                                <FiX />
                                                            </button>
                                                        </div>
                                                    )}
                                                    {request.status === 'approved' && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); initiateRefund(request); }}
                                                            disabled={processingId === request.id}
                                                            className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 disabled:opacity-50 text-sm"
                                                        >
                                                            <FiDollarSign />
                                                            Refund
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                            {expandedRow === request.id && (
                                                <tr className="bg-gray-50 dark:bg-gray-900">
                                                    <td colSpan={8} className="px-4 py-4">
                                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                                            <div>
                                                                <p className="text-gray-500 mb-1">Customer Details</p>
                                                                <p className="flex items-center gap-2"><FiUser /> {request.customerName}</p>
                                                                <p className="flex items-center gap-2"><FiMail /> {request.customerEmail || '-'}</p>
                                                                <p className="flex items-center gap-2"><FiPhone /> {request.customerPhone || '-'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-500 mb-1">Return Reason</p>
                                                                <p className="font-medium">{request.reason}</p>
                                                                {request.comments && <p className="text-gray-600 mt-1">{request.comments}</p>}
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-500 mb-1">Return Images</p>
                                                                {request.images && request.images.length > 0 ? (
                                                                    <div className="flex gap-2">
                                                                        {request.images.map((img, i) => (
                                                                            <img key={i} src={img} alt={`Return ${i + 1}`} className="w-16 h-16 object-cover rounded" />
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-gray-400">No images attached</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}

                    {/* Refunds History Table */}
                    {activeTab === 'refunds' && (
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-900">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Refund ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">CF Refund ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Initiated</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y dark:divide-gray-700">
                                {filteredRefunds.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                                            No refund records found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRefunds.map((refund) => (
                                        <tr key={refund.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-4 py-3 text-sm font-mono">{refund.id}</td>
                                            <td className="px-4 py-3 text-sm">{refund.orderId}</td>
                                            <td className="px-4 py-3 text-sm font-mono text-gray-500">{refund.cfRefundId || '-'}</td>
                                            <td className="px-4 py-3 text-sm font-medium text-green-600">{formatCurrency(refund.refundAmount)}</td>
                                            <td className="px-4 py-3 text-sm capitalize">{refund.refundType}</td>
                                            <td className="px-4 py-3">{getStatusBadge(refund.status)}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500">{formatDate(refund.initiatedAt)}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500">{formatDate(refund.completedAt) || '-'}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
}
