'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';
import {
    FiPackage,
    FiLoader,
    FiShoppingBag,
    FiChevronRight,
    FiChevronLeft,
    FiCheck,
    FiTruck,
    FiHome,
    FiClock,
    FiCreditCard,
    FiX,
    FiAlertCircle,
    FiCalendar,
    FiFilter
} from 'react-icons/fi';

interface Order {
    id: string;
    orderId: string;
    cfOrderId?: string;
    productId: string;
    productName: string;
    productImage?: string;
    productCategory: string;
    partNumber?: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    paymentMethod: string;
    paymentStatus: string;
    status: string;
    customerName: string;
    phone?: string;
    address: string;
    shippingAddress?: {
        addressLine1?: string;
        city?: string;
        state?: string;
        pincode?: string;
    };
    createdAt: any;
    updatedAt?: any;
}

const statusSteps = [
    { id: 'pending', label: 'Order Placed', icon: FiClock },
    { id: 'confirmed', label: 'Confirmed', icon: FiCheck },
    { id: 'shipped', label: 'Shipped', icon: FiTruck },
    { id: 'delivered', label: 'Delivered', icon: FiHome },
];

const getStatusIndex = (status: string): number => {
    const index = statusSteps.findIndex(s => s.id === status);
    return index >= 0 ? index : 0;
};

const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
        case 'delivered':
            return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400';
        case 'shipped':
            return 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400';
        case 'confirmed':
            return 'text-indigo-600 bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-400';
        case 'cancelled':
        case 'payment_failed':
        case 'payment_dropped':
            return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400';
        case 'pending':
        default:
            return 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400';
    }
};

const getPaymentBadge = (paymentStatus: string, paymentMethod: string | object) => {
    const isPaid = paymentStatus === 'paid';
    const isFailed = paymentStatus === 'failed' || paymentStatus === 'dropped';

    // Normalize paymentMethod if it's an object
    const method = typeof paymentMethod === 'object' ? Object.keys(paymentMethod || {})[0] || 'online' : paymentMethod;

    if (isFailed) {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                <FiX className="w-3 h-3" /> Payment Failed
            </span>
        );
    }

    if (isPaid) {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                <FiCheck className="w-3 h-3" /> Paid
            </span>
        );
    }

    if (method === 'COD') {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                <FiCreditCard className="w-3 h-3" /> Pay on Delivery
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
            <FiClock className="w-3 h-3" /> Pending
        </span>
    );
};

export default function OrdersPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

    // Filtering state
    const [filterType, setFilterType] = useState<'all' | 'month' | 'year' | 'date'>('all');
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [selectedDate, setSelectedDate] = useState<string>('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 5;

    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login?redirect=/orders');
        }
    }, [user, authLoading, router]);

    // Fetch orders from Firestore
    useEffect(() => {
        async function fetchOrders() {
            if (!user) return;

            try {
                const ordersQuery = query(
                    collection(db, 'orders'),
                    where('customerId', '==', user.uid)
                );

                const ordersSnapshot = await getDocs(ordersQuery);

                const fetchedOrders: Order[] = ordersSnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        orderId: data.orderId || doc.id,
                        cfOrderId: data.cfOrderId,
                        productId: data.productId,
                        productName: data.productName || 'Unknown Product',
                        productImage: data.productImage,
                        productCategory: data.productCategory,
                        partNumber: data.partNumber,
                        quantity: data.quantity || 1,
                        unitPrice: data.unitPrice || 0,
                        totalAmount: data.totalAmount || 0,
                        paymentMethod: typeof data.paymentMethod === 'object'
                            ? Object.keys(data.paymentMethod || {})[0] || 'online'
                            : data.paymentMethod || 'COD',
                        paymentStatus: data.paymentStatus || 'pending',
                        status: data.status || 'pending',
                        customerName: data.customerName,
                        phone: data.phone,
                        address: data.address,
                        shippingAddress: data.shippingAddress,
                        createdAt: data.createdAt,
                        updatedAt: data.updatedAt,
                    };
                });

                // Sort by creation date (newest first)
                fetchedOrders.sort((a, b) => {
                    const dateA = a.createdAt?.toDate?.() || new Date(0);
                    const dateB = b.createdAt?.toDate?.() || new Date(0);
                    return dateB.getTime() - dateA.getTime();
                });

                setOrders(fetchedOrders);
            } catch (error) {
                console.error('Error fetching orders:', error);
                setOrders([]);
            } finally {
                setLoading(false);
            }
        }

        if (user) {
            fetchOrders();
        }
    }, [user]);

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'N/A';
        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            return date.toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return 'N/A';
        }
    };

    const formatCurrency = (amount: number) => {
        return `₹${(amount || 0).toLocaleString('en-IN')}`;
    };

    const isCancelledOrFailed = (status: string) => {
        return ['cancelled', 'payment_failed', 'payment_dropped'].includes(status?.toLowerCase());
    };

    // Month names for dropdown
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Generate year options (last 5 years)
    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

    // Filter orders based on selected filter
    const filteredOrders = orders.filter(order => {
        if (filterType === 'all') return true;

        const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);

        if (filterType === 'month') {
            return orderDate.getMonth() === selectedMonth && orderDate.getFullYear() === selectedYear;
        }

        if (filterType === 'year') {
            return orderDate.getFullYear() === selectedYear;
        }

        if (filterType === 'date' && selectedDate) {
            const selected = new Date(selectedDate);
            return orderDate.toDateString() === selected.toDateString();
        }

        return true;
    });

    // Pagination calculations
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
    const startIndex = (currentPage - 1) * ordersPerPage;
    const endIndex = startIndex + ordersPerPage;
    const currentOrders = filteredOrders.slice(startIndex, endIndex);

    // Reset to page 1 when filter changes
    const handleFilterChange = (newFilterType: 'all' | 'month' | 'year' | 'date') => {
        setFilterType(newFilterType);
        setCurrentPage(1);
    };

    if (authLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
                <FiLoader className="text-4xl text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="bg-gray-50 dark:bg-black min-h-screen py-8 md:py-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <FiPackage className="text-blue-600" />
                            My Orders
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            {orders.length} order{orders.length !== 1 ? 's' : ''} placed
                        </p>
                    </div>
                    <Link
                        href="/profile"
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                    >
                        Back to Profile <FiChevronRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Filter Bar */}
                {orders.length > 0 && (
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 mb-6">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <FiFilter className="w-4 h-4" />
                                <span className="text-sm font-medium">Filter by:</span>
                            </div>

                            {/* Filter Type Buttons */}
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => handleFilterChange('all')}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterType === 'all'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    All Orders
                                </button>
                                <button
                                    onClick={() => handleFilterChange('month')}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterType === 'month'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    By Month
                                </button>
                                <button
                                    onClick={() => handleFilterChange('year')}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterType === 'year'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    By Year
                                </button>
                                <button
                                    onClick={() => handleFilterChange('date')}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterType === 'date'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    By Date
                                </button>
                            </div>

                            {/* Filter Inputs */}
                            {filterType === 'month' && (
                                <div className="flex gap-2">
                                    <select
                                        value={selectedMonth}
                                        onChange={(e) => { setSelectedMonth(Number(e.target.value)); setCurrentPage(1); }}
                                        className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                                    >
                                        {monthNames.map((month, index) => (
                                            <option key={month} value={index}>{month}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => { setSelectedYear(Number(e.target.value)); setCurrentPage(1); }}
                                        className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                                    >
                                        {yearOptions.map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {filterType === 'year' && (
                                <select
                                    value={selectedYear}
                                    onChange={(e) => { setSelectedYear(Number(e.target.value)); setCurrentPage(1); }}
                                    className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                                >
                                    {yearOptions.map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            )}

                            {filterType === 'date' && (
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => { setSelectedDate(e.target.value); setCurrentPage(1); }}
                                    className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                                />
                            )}
                        </div>

                        {/* Filter Results Summary */}
                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">
                                Showing {filteredOrders.length} of {orders.length} orders
                                {filterType !== 'all' && (
                                    <span className="ml-1">
                                        {filterType === 'month' && `for ${monthNames[selectedMonth]} ${selectedYear}`}
                                        {filterType === 'year' && `for ${selectedYear}`}
                                        {filterType === 'date' && selectedDate && `for ${new Date(selectedDate).toLocaleDateString('en-IN')}`}
                                    </span>
                                )}
                            </span>
                            {filterType !== 'all' && (
                                <button
                                    onClick={() => handleFilterChange('all')}
                                    className="text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Clear Filter
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Orders List */}
                {loading ? (
                    <div className="flex justify-center py-16">
                        <div className="text-center">
                            <FiLoader className="text-4xl text-blue-600 animate-spin mx-auto mb-4" />
                            <p className="text-gray-500">Loading your orders...</p>
                        </div>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-12 text-center">
                        <FiShoppingBag className="text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No orders yet</h2>
                        <p className="text-gray-500 mb-6">Start shopping to see your orders here!</p>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                        >
                            <FiShoppingBag /> Browse Products
                        </Link>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-12 text-center">
                        <FiCalendar className="text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No orders found</h2>
                        <p className="text-gray-500 mb-6">No orders match your selected filter.</p>
                        <button
                            onClick={() => handleFilterChange('all')}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                        >
                            View All Orders
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="space-y-4">
                            {currentOrders.map((order) => {
                                const isExpanded = expandedOrder === order.id;
                                const currentStatus = getStatusIndex(order.status);
                                const isFailed = isCancelledOrFailed(order.status);

                                return (
                                    <div
                                        key={order.id}
                                        className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-300"
                                    >
                                        {/* Order Header - Always visible */}
                                        <div
                                            className="p-4 md:p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                            onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                                        >
                                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                                                {/* Product Image */}
                                                <div className="flex-shrink-0">
                                                    <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
                                                        {order.productImage ? (
                                                            <Image
                                                                src={order.productImage}
                                                                alt={order.productName}
                                                                width={96}
                                                                height={96}
                                                                className="w-full h-full object-contain"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <FiPackage className="text-3xl text-gray-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Order Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                                                        <div>
                                                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                                                {order.productName}
                                                            </h3>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                Order #{order.orderId} • {formatDate(order.createdAt)}
                                                            </p>
                                                        </div>
                                                        <div className={`px-3 py-1 rounded-full text-xs font-semibold border capitalize ${getStatusColor(order.status)}`}>
                                                            {order.status.replace(/_/g, ' ')}
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-4 text-sm">
                                                        <span className="text-gray-600 dark:text-gray-300">
                                                            Qty: <strong>{order.quantity}</strong>
                                                        </span>
                                                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                                                            {formatCurrency(order.totalAmount)}
                                                        </span>
                                                        {getPaymentBadge(order.paymentStatus, order.paymentMethod)}
                                                    </div>
                                                </div>

                                                {/* Expand/Collapse Icon */}
                                                <div className="flex-shrink-0">
                                                    <FiChevronRight
                                                        className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expanded Details */}
                                        {isExpanded && (
                                            <div className="border-t border-gray-100 dark:border-gray-800 p-4 md:p-6 bg-gray-50/50 dark:bg-gray-800/30">
                                                {/* Status Timeline */}
                                                {!isFailed ? (
                                                    <div className="mb-6">
                                                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Order Status</h4>
                                                        <div className="flex items-center justify-between relative">
                                                            {/* Progress Line */}
                                                            <div className="absolute left-0 right-0 top-5 h-1 bg-gray-200 dark:bg-gray-700 rounded-full">
                                                                <div
                                                                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                                                                    style={{ width: `${(currentStatus / (statusSteps.length - 1)) * 100}%` }}
                                                                />
                                                            </div>

                                                            {/* Steps */}
                                                            {statusSteps.map((step, index) => {
                                                                const isCompleted = index <= currentStatus;
                                                                const isCurrent = index === currentStatus;
                                                                const StepIcon = step.icon;

                                                                return (
                                                                    <div key={step.id} className="relative z-10 flex flex-col items-center">
                                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted
                                                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                                                                            } ${isCurrent ? 'ring-4 ring-blue-200 dark:ring-blue-900' : ''}`}>
                                                                            <StepIcon className="w-5 h-5" />
                                                                        </div>
                                                                        <span className={`text-xs mt-2 font-medium ${isCompleted ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
                                                                            }`}>
                                                                            {step.label}
                                                                        </span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                                                        <div className="flex items-center gap-3 text-red-700 dark:text-red-400">
                                                            <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
                                                            <div>
                                                                <p className="font-medium">Order {order.status.replace(/_/g, ' ')}</p>
                                                                <p className="text-sm text-red-600 dark:text-red-500">
                                                                    {order.status === 'payment_failed' && 'Payment could not be processed. Please try again.'}
                                                                    {order.status === 'payment_dropped' && 'Payment was not completed.'}
                                                                    {order.status === 'cancelled' && 'This order has been cancelled.'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Order Details Grid */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {/* Shipping Address */}
                                                    <div>
                                                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Shipping Address</h4>
                                                        <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                                                            <p className="font-medium text-gray-900 dark:text-white">{order.customerName}</p>
                                                            {order.phone && <p className="text-sm text-gray-600 dark:text-gray-400">{order.phone}</p>}
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                                {order.shippingAddress ? (
                                                                    <>
                                                                        {order.shippingAddress.addressLine1}<br />
                                                                        {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                                                                    </>
                                                                ) : (
                                                                    order.address
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Payment Info */}
                                                    <div>
                                                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Payment Details</h4>
                                                        <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                                                            <div className="flex justify-between mb-2">
                                                                <span className="text-gray-600 dark:text-gray-400">Method</span>
                                                                <span className="font-medium text-gray-900 dark:text-white capitalize">
                                                                    {order.paymentMethod === 'COD' ? 'Cash on Delivery' :
                                                                        typeof order.paymentMethod === 'object' ? Object.keys(order.paymentMethod || {})[0] || 'Online' :
                                                                            order.paymentMethod || 'N/A'}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between mb-2">
                                                                <span className="text-gray-600 dark:text-gray-400">Status</span>
                                                                <span className={`font-medium capitalize ${order.paymentStatus === 'paid' ? 'text-green-600' :
                                                                    order.paymentStatus === 'failed' ? 'text-red-600' : 'text-amber-600'
                                                                    }`}>
                                                                    {order.paymentStatus}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                                                                <span className="text-gray-600 dark:text-gray-400">Total</span>
                                                                <span className="font-bold text-lg text-gray-900 dark:text-white">
                                                                    {formatCurrency(order.totalAmount)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Product Details */}
                                                <div className="mt-6">
                                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Product Details</h4>
                                                    <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                                                        <div className="flex justify-between items-center">
                                                            <div>
                                                                <p className="font-medium text-gray-900 dark:text-white">{order.productName}</p>
                                                                {order.partNumber && (
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Part No: {order.partNumber}</p>
                                                                )}
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                    {formatCurrency(order.unitPrice)} × {order.quantity}
                                                                </p>
                                                                <p className="font-bold text-gray-900 dark:text-white">
                                                                    {formatCurrency(order.totalAmount)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="mt-6 flex flex-wrap gap-3">
                                                    <Link
                                                        href={`/product/${order.productId}?category=${order.productCategory}`}
                                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                                                    >
                                                        View Product
                                                    </Link>
                                                    {order.status === 'delivered' && (
                                                        <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-sm font-medium transition-colors">
                                                            Write a Review
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-8 flex items-center justify-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <FiChevronLeft className="w-5 h-5" />
                                </button>

                                {/* Page Numbers */}
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${currentPage === page
                                                ? 'bg-blue-600 text-white'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <FiChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}

                        {/* Page Info */}
                        {totalPages > 1 && (
                            <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                Page {currentPage} of {totalPages} · Showing {startIndex + 1}-{Math.min(endIndex, filteredOrders.length)} of {filteredOrders.length} orders
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
