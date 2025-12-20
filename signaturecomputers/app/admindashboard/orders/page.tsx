'use client';

import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FiSearch, FiFilter, FiPrinter, FiEye, FiCheck, FiX, FiCalendar, FiChevronLeft, FiChevronRight, FiChevronDown, FiMapPin, FiPhone, FiMail, FiPackage, FiCreditCard, FiTruck, FiClock, FiUser } from 'react-icons/fi';
import { toast } from 'sonner';
import Link from 'next/link';

interface Order {
    id: string;
    orderNo: string;
    orderId: string;
    cfOrderId?: string;
    partNumber: string;
    productName: string;
    productCategory?: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    paymentId: string;
    cfPaymentId?: string;
    paymentStatus?: string;
    paymentMethod?: string;
    address: string;
    shippingAddress?: {
        addressLine1?: string;
        city?: string;
        state?: string;
        pincode?: string;
    };
    customerName: string;
    customerEmail?: string;
    phone?: string;
    createdAt?: any;
    updatedAt?: any;
    status?: string;
    [key: string]: any;
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

    // Date filtering state
    const [dateFilterType, setDateFilterType] = useState<'all' | 'month' | 'year' | 'date'>('all');
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [selectedDate, setSelectedDate] = useState<string>('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 10;

    // Expanded order state
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

    const statuses = [
        { id: 'all', name: 'All Orders' },
        { id: 'pending', name: 'Pending' },
        { id: 'confirmed', name: 'Confirmed' },
        { id: 'shipped', name: 'Shipped' },
        { id: 'delivered', name: 'Delivered' },
        { id: 'cancelled', name: 'Cancelled' },
        { id: 'payment_failed', name: 'Payment Failed' },
    ];

    const getPaymentStatusBadge = (paymentStatus?: string, paymentMethod?: string) => {
        const status = paymentStatus?.toLowerCase() || 'pending';
        const method = paymentMethod || (status === 'pending' ? 'COD' : '');

        const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
            paid: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'Paid' },
            pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', label: 'Pending' },
            failed: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: 'Failed' },
            dropped: { bg: 'bg-gray-100 dark:bg-gray-700/30', text: 'text-gray-700 dark:text-gray-400', label: 'Dropped' },
        };

        const config = statusConfig[status] || statusConfig.pending;

        return (
            <div className="flex flex-col gap-1">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                    {config.label}
                </span>
                {method && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {typeof method === 'object' ? Object.keys(method)[0] : method}
                    </span>
                )}
            </div>
        );
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const ordersRef = collection(db, 'orders');
            const querySnapshot = await getDocs(ordersRef);
            const ordersData = querySnapshot.docs.map((doc, index) => ({
                id: doc.id,
                orderNo: String(index + 1).padStart(4, '0'),
                ...doc.data()
            })) as Order[];

            // Sort by createdAt descending
            ordersData.sort((a, b) => {
                const dateA = a.createdAt?.toDate?.() || new Date(0);
                const dateB = b.createdAt?.toDate?.() || new Date(0);
                return dateB.getTime() - dateA.getTime();
            });

            setOrders(ordersData);
        } catch (error) {
            console.error('Warning: Failed to fetch orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        setUpdatingStatus(orderId);
        try {
            const orderRef = doc(db, 'orders', orderId);
            await updateDoc(orderRef, {
                status: newStatus,
                updatedAt: new Date()
            });

            // Update local state
            setOrders(prev => prev.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            ));

            toast.success(`Order status updated to ${newStatus}`);
        } catch (error) {
            console.error('Failed to update status:', error);
            toast.error('Failed to update order status');
        } finally {
            setUpdatingStatus(null);
        }
    };

    const formatCurrency = (amount: number) => {
        return `₹${(amount || 0).toLocaleString('en-IN')}`;
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return '-';
        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            return date.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return '-';
        }
    };

    const handlePrint = (order: Order) => {
        const totalAmount = order.totalAmount || (order.unitPrice * (order.quantity || 1));
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                <head>
                    <title>Invoice - ${order.orderId || order.id}</title>
                    <style>
                        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
                        .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
                        .invoice-title { font-size: 14px; color: #666; }
                        .section { margin-bottom: 25px; }
                        .section-title { font-size: 12px; color: #666; text-transform: uppercase; margin-bottom: 8px; }
                        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                        th { background: #f8f8f8; font-weight: 600; }
                        .total-row { background: #f0f7ff; font-weight: bold; }
                        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
                        @media print { body { padding: 20px; } }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="logo">Signature Computers</div>
                        <div class="invoice-title">
                            <strong>TAX INVOICE</strong><br>
                            Order: ${order.orderId || order.id}
                        </div>
                    </div>
                    
                    <div class="grid">
                        <div class="section">
                            <div class="section-title">Bill To</div>
                            <strong>${order.customerName || '-'}</strong><br>
                            ${order.phone || ''}<br>
                            ${order.address || '-'}
                        </div>
                        <div class="section">
                            <div class="section-title">Order Details</div>
                            <strong>Date:</strong> ${formatDate(order.createdAt)}<br>
                            <strong>Status:</strong> ${order.status || 'pending'}<br>
                            <strong>Payment ID:</strong> ${order.paymentId || '-'}
                        </div>
                    </div>
                    
                    <table>
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Part No.</th>
                                <th>Qty</th>
                                <th>Unit Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>${order.productName || '-'}</td>
                                <td>${order.partNumber || '-'}</td>
                                <td>${order.quantity || 1}</td>
                                <td>${formatCurrency(order.unitPrice || 0)}</td>
                                <td>${formatCurrency(totalAmount)}</td>
                            </tr>
                            <tr class="total-row">
                                <td colspan="4" style="text-align: right">Grand Total</td>
                                <td>${formatCurrency(totalAmount)}</td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <div class="footer">
                        Thank you for shopping with Signature Computers!<br>
                        For support, contact us at support@signaturecomputers.com
                    </div>
                </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    };

    // Month names for dropdown
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Generate year options (last 5 years)
    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            (order.customerName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (order.productName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (order.orderId?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (order.partNumber?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (order.phone || '').includes(searchQuery);

        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

        // Date filtering
        let matchesDate = true;
        if (dateFilterType !== 'all' && order.createdAt) {
            const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);

            if (dateFilterType === 'month') {
                matchesDate = orderDate.getMonth() === selectedMonth && orderDate.getFullYear() === selectedYear;
            } else if (dateFilterType === 'year') {
                matchesDate = orderDate.getFullYear() === selectedYear;
            } else if (dateFilterType === 'date' && selectedDate) {
                const selected = new Date(selectedDate);
                matchesDate = orderDate.toDateString() === selected.toDateString();
            }
        }

        return matchesSearch && matchesStatus && matchesDate;
    });

    // Pagination calculations
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
    const startIndex = (currentPage - 1) * ordersPerPage;
    const endIndex = startIndex + ordersPerPage;
    const currentOrders = filteredOrders.slice(startIndex, endIndex);

    // Reset pagination when filters change
    const handleDateFilterChange = (newType: 'all' | 'month' | 'year' | 'date') => {
        setDateFilterType(newType);
        setCurrentPage(1);
    };

    // Calculate summary stats
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || (order.unitPrice * (order.quantity || 1)) || 0), 0);
    const pendingCount = orders.filter(o => o.status === 'pending' || !o.status).length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white">Orders</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {orders.length} total orders • {pendingCount} pending • {formatCurrency(totalRevenue)} revenue
                    </p>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, product, order ID, phone..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <FiFilter className="text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                            className="p-2 pr-8 rounded-lg border dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                        >
                            {statuses.map(status => (
                                <option key={status.id} value={status.id}>{status.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Date Filters */}
                <div className="flex flex-col md:flex-row md:items-center gap-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <FiCalendar className="w-4 h-4" />
                        <span className="text-sm font-medium">Date:</span>
                    </div>

                    {/* Date Filter Type Buttons */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => handleDateFilterChange('all')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${dateFilterType === 'all'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                        >
                            All Time
                        </button>
                        <button
                            onClick={() => handleDateFilterChange('month')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${dateFilterType === 'month'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                        >
                            Month
                        </button>
                        <button
                            onClick={() => handleDateFilterChange('year')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${dateFilterType === 'year'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                        >
                            Year
                        </button>
                        <button
                            onClick={() => handleDateFilterChange('date')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${dateFilterType === 'date'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                        >
                            Date
                        </button>
                    </div>

                    {/* Date Filter Inputs */}
                    {dateFilterType === 'month' && (
                        <div className="flex gap-2">
                            <select
                                value={selectedMonth}
                                onChange={(e) => { setSelectedMonth(Number(e.target.value)); setCurrentPage(1); }}
                                className="px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                            >
                                {monthNames.map((month, index) => (
                                    <option key={month} value={index}>{month}</option>
                                ))}
                            </select>
                            <select
                                value={selectedYear}
                                onChange={(e) => { setSelectedYear(Number(e.target.value)); setCurrentPage(1); }}
                                className="px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                            >
                                {yearOptions.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {dateFilterType === 'year' && (
                        <select
                            value={selectedYear}
                            onChange={(e) => { setSelectedYear(Number(e.target.value)); setCurrentPage(1); }}
                            className="px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                        >
                            {yearOptions.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    )}

                    {dateFilterType === 'date' && (
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => { setSelectedDate(e.target.value); setCurrentPage(1); }}
                            className="px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                        />
                    )}

                    {/* Results count */}
                    <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">
                        {filteredOrders.length} of {orders.length} orders
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-medium">
                            <tr>
                                <th className="p-4">Order ID</th>
                                <th className="p-4">CF Order</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Customer</th>
                                <th className="p-4">Product</th>
                                <th className="p-4">Qty</th>
                                <th className="p-4">Amount</th>
                                <th className="p-4">Payment</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={10} className="p-8 text-center text-gray-500">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                            Loading orders...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="p-8 text-center text-gray-500">No orders found.</td>
                                </tr>
                            ) : (
                                currentOrders.map((order) => {
                                    const isExpanded = expandedOrder === order.id;
                                    return (
                                        <React.Fragment key={order.id}>
                                            <tr
                                                className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer ${isExpanded ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                                                onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                                            >
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <FiChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                                        <div className="font-mono text-xs font-semibold text-gray-700 dark:text-gray-300" title={order.orderId || order.id}>
                                                            {order.orderId || order.id.slice(0, 12)}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    {order.cfOrderId ? (
                                                        <div className="font-mono text-xs text-blue-600 dark:text-blue-400" title={order.cfOrderId}>
                                                            {order.cfOrderId.slice(0, 12)}...
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">-</span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-gray-500 dark:text-gray-400 text-xs">
                                                    {formatDate(order.createdAt)}
                                                </td>
                                                <td className="p-4">
                                                    <div className="font-medium dark:text-gray-200">{order.customerName || '-'}</div>
                                                    {order.phone && <div className="text-xs text-gray-500">{order.phone}</div>}
                                                </td>
                                                <td className="p-4 font-medium dark:text-gray-200 max-w-[150px] truncate" title={order.productName}>
                                                    {order.productName || '-'}
                                                </td>
                                                <td className="p-4 dark:text-gray-200">
                                                    {order.quantity || 1}
                                                </td>
                                                <td className="p-4 font-semibold text-green-600 dark:text-green-400">
                                                    {formatCurrency(order.totalAmount || (order.unitPrice * (order.quantity || 1)))}
                                                </td>
                                                <td className="p-4">
                                                    {getPaymentStatusBadge(order.paymentStatus, order.paymentMethod)}
                                                </td>
                                                <td className="p-4" onClick={(e) => e.stopPropagation()}>
                                                    <select
                                                        value={order.status || 'pending'}
                                                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                        disabled={updatingStatus === order.id}
                                                        className={`px-2 py-1 rounded-lg text-xs font-medium border-0 cursor-pointer focus:ring-2 focus:ring-blue-500 ${order.status === 'delivered' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                            order.status === 'shipped' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                                order.status === 'confirmed' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' :
                                                                    order.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                            }`}
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="confirmed">Confirmed</option>
                                                        <option value="shipped">Shipped</option>
                                                        <option value="delivered">Delivered</option>
                                                        <option value="cancelled">Cancelled</option>
                                                    </select>
                                                </td>
                                                <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        onClick={() => handlePrint(order)}
                                                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg dark:hover:bg-blue-900/20 transition-colors"
                                                        title="Print Invoice"
                                                    >
                                                        <FiPrinter />
                                                    </button>
                                                </td>
                                            </tr>

                                            {/* Expanded Order Details */}
                                            {isExpanded && (
                                                <tr>
                                                    <td colSpan={10} className="p-0 bg-gray-50 dark:bg-gray-800/50">
                                                        <div className="p-6 border-t border-b border-gray-200 dark:border-gray-700">
                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                                {/* Customer Information */}
                                                                <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                                                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                                                        <FiUser className="text-blue-600" />
                                                                        Customer Details
                                                                    </h4>
                                                                    <div className="space-y-2 text-sm">
                                                                        <div className="flex items-start gap-2">
                                                                            <span className="text-gray-500 dark:text-gray-400 w-20">Name:</span>
                                                                            <span className="font-medium text-gray-900 dark:text-white">{order.customerName || '-'}</span>
                                                                        </div>
                                                                        <div className="flex items-start gap-2">
                                                                            <span className="text-gray-500 dark:text-gray-400 w-20">Phone:</span>
                                                                            <span className="text-gray-700 dark:text-gray-300">{order.phone || '-'}</span>
                                                                        </div>
                                                                        <div className="flex items-start gap-2">
                                                                            <span className="text-gray-500 dark:text-gray-400 w-20">Email:</span>
                                                                            <span className="text-gray-700 dark:text-gray-300 text-xs break-all">{order.customerEmail || '-'}</span>
                                                                        </div>
                                                                        <div className="flex items-start gap-2">
                                                                            <span className="text-gray-500 dark:text-gray-400 w-20">Address:</span>
                                                                            <span className="text-gray-700 dark:text-gray-300">
                                                                                {order.shippingAddress ? (
                                                                                    <>
                                                                                        {order.shippingAddress.addressLine1}<br />
                                                                                        {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                                                                                    </>
                                                                                ) : order.address || '-'}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Product Information */}
                                                                <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                                                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                                                        <FiPackage className="text-blue-600" />
                                                                        Product Details
                                                                    </h4>
                                                                    <div className="space-y-2 text-sm">
                                                                        <div className="flex items-start gap-2">
                                                                            <span className="text-gray-500 dark:text-gray-400 w-20">Product:</span>
                                                                            <span className="font-medium text-gray-900 dark:text-white">{order.productName || '-'}</span>
                                                                        </div>
                                                                        <div className="flex items-start gap-2">
                                                                            <span className="text-gray-500 dark:text-gray-400 w-20">Part No:</span>
                                                                            <span className="font-mono text-xs text-gray-700 dark:text-gray-300">{order.partNumber || '-'}</span>
                                                                        </div>
                                                                        <div className="flex items-start gap-2">
                                                                            <span className="text-gray-500 dark:text-gray-400 w-20">Category:</span>
                                                                            <span className="text-gray-700 dark:text-gray-300 capitalize">{order.productCategory || '-'}</span>
                                                                        </div>
                                                                        <div className="flex items-start gap-2">
                                                                            <span className="text-gray-500 dark:text-gray-400 w-20">Quantity:</span>
                                                                            <span className="text-gray-700 dark:text-gray-300">{order.quantity || 1}</span>
                                                                        </div>
                                                                        <div className="flex items-start gap-2">
                                                                            <span className="text-gray-500 dark:text-gray-400 w-20">Unit Price:</span>
                                                                            <span className="text-gray-700 dark:text-gray-300">{formatCurrency(order.unitPrice)}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Payment Information */}
                                                                <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                                                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                                                        <FiCreditCard className="text-blue-600" />
                                                                        Payment Details
                                                                    </h4>
                                                                    <div className="space-y-2 text-sm">
                                                                        <div className="flex items-start gap-2">
                                                                            <span className="text-gray-500 dark:text-gray-400 w-20">Method:</span>
                                                                            <span className="font-medium text-gray-900 dark:text-white capitalize">
                                                                                {order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod || '-'}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex items-start gap-2">
                                                                            <span className="text-gray-500 dark:text-gray-400 w-20">Status:</span>
                                                                            <span className={`font-medium capitalize ${order.paymentStatus === 'paid' ? 'text-green-600' :
                                                                                order.paymentStatus === 'failed' ? 'text-red-600' : 'text-amber-600'
                                                                                }`}>
                                                                                {order.paymentStatus || 'pending'}
                                                                            </span>
                                                                        </div>
                                                                        {order.cfPaymentId && (
                                                                            <div className="flex items-start gap-2">
                                                                                <span className="text-gray-500 dark:text-gray-400 w-20">CF Pay ID:</span>
                                                                                <span className="font-mono text-xs text-gray-700 dark:text-gray-300">{order.cfPaymentId}</span>
                                                                            </div>
                                                                        )}
                                                                        <div className="pt-2 mt-2 border-t border-gray-100 dark:border-gray-800">
                                                                            <div className="flex items-start gap-2">
                                                                                <span className="text-gray-500 dark:text-gray-400 w-20">Total:</span>
                                                                                <span className="font-bold text-lg text-green-600 dark:text-green-400">
                                                                                    {formatCurrency(order.totalAmount || (order.unitPrice * (order.quantity || 1)))}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Order Timeline & Actions */}
                                                            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                                                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                                                                    <div>Created: {formatDate(order.createdAt)}</div>
                                                                    {order.updatedAt && <div>Updated: {formatDate(order.updatedAt)}</div>}
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); handlePrint(order); }}
                                                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors"
                                                                    >
                                                                        <FiPrinter className="w-4 h-4" /> Print Invoice
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Showing {startIndex + 1}-{Math.min(endIndex, filteredOrders.length)} of {filteredOrders.length} orders
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <FiChevronLeft className="w-4 h-4" />
                            </button>

                            {/* Page Numbers */}
                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
                                                ? 'bg-blue-600 text-white'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <FiChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
