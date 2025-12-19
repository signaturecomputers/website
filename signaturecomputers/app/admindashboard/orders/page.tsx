'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FiSearch, FiFilter, FiPrinter, FiEye, FiCheck, FiX } from 'react-icons/fi';
import { toast } from 'sonner';
import Link from 'next/link';

interface Order {
    id: string;
    orderNo: string;
    orderId: string;
    partNumber: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    paymentId: string;
    address: string;
    customerName: string;
    phone?: string;
    createdAt?: any;
    status?: string;
    [key: string]: any;
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

    const statuses = [
        { id: 'all', name: 'All Orders' },
        { id: 'pending', name: 'Pending' },
        { id: 'confirmed', name: 'Confirmed' },
        { id: 'shipped', name: 'Shipped' },
        { id: 'delivered', name: 'Delivered' },
        { id: 'cancelled', name: 'Cancelled' },
    ];

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

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            (order.customerName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (order.productName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (order.orderId?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (order.partNumber?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (order.phone || '').includes(searchQuery);

        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

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
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, product, order ID, phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <FiFilter className="text-gray-400" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="p-2 pr-8 rounded-lg border dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                        {statuses.map(status => (
                            <option key={status.id} value={status.id}>{status.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-medium">
                            <tr>
                                <th className="p-4">Order ID</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Customer</th>
                                <th className="p-4">Product</th>
                                <th className="p-4">Qty</th>
                                <th className="p-4">Amount</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center text-gray-500">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                            Loading orders...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center text-gray-500">No orders found.</td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-mono text-xs text-gray-500 dark:text-gray-400">
                                                {(order.orderId || order.id).slice(0, 20)}...
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-500 dark:text-gray-400 text-xs">
                                            {formatDate(order.createdAt)}
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium dark:text-gray-200">{order.customerName || '-'}</div>
                                            {order.phone && <div className="text-xs text-gray-500">{order.phone}</div>}
                                        </td>
                                        <td className="p-4 font-medium dark:text-gray-200 max-w-[200px] truncate">
                                            {order.productName || '-'}
                                        </td>
                                        <td className="p-4 dark:text-gray-200">
                                            {order.quantity || 1}
                                        </td>
                                        <td className="p-4 font-semibold text-green-600 dark:text-green-400">
                                            {formatCurrency(order.totalAmount || (order.unitPrice * (order.quantity || 1)))}
                                        </td>
                                        <td className="p-4">
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
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handlePrint(order)}
                                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg dark:hover:bg-blue-900/20 transition-colors"
                                                title="Print Invoice"
                                            >
                                                <FiPrinter />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
