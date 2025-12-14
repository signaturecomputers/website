'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FiSearch, FiFilter, FiPrinter, FiEye } from 'react-icons/fi';
import { toast } from 'sonner';
import Link from 'next/link';

interface Order {
    id: string;
    orderNo: string;
    orderId: string;
    partNumber: string;
    productName: string;
    quantity: number;
    paymentId: string;
    address: string;
    customerName: string;
    createdAt?: any;
    status?: string;
    [key: string]: any;
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

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
            const q = query(ordersRef, orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const ordersData = querySnapshot.docs.map((doc, index) => ({
                id: doc.id,
                orderNo: String(index + 1).padStart(4, '0'),
                ...doc.data()
            })) as Order[];
            setOrders(ordersData);
        } catch (error) {
            console.warn('Warning: Failed to fetch orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = (order: Order) => {
        // Open print dialog for the order
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                <head>
                    <title>Order #${order.orderNo}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        h1 { color: #333; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                        th { background: #f5f5f5; }
                        .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Signature Computers</h1>
                        <p>Order Invoice</p>
                    </div>
                    <table>
                        <tr><th>Order No</th><td>${order.orderNo}</td></tr>
                        <tr><th>Order ID</th><td>${order.orderId || order.id}</td></tr>
                        <tr><th>Customer Name</th><td>${order.customerName || '-'}</td></tr>
                        <tr><th>Address</th><td>${order.address || '-'}</td></tr>
                        <tr><th>Product Name</th><td>${order.productName || '-'}</td></tr>
                        <tr><th>Part Number</th><td>${order.partNumber || '-'}</td></tr>
                        <tr><th>Quantity</th><td>${order.quantity || 1}</td></tr>
                        <tr><th>Payment ID</th><td>${order.paymentId || '-'}</td></tr>
                    </table>
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
            (order.partNumber?.toLowerCase() || '').includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold dark:text-white">Orders</h1>
            </div>

            {/* Filters & Search */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search orders..."
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
                                <th className="p-4">Order No</th>
                                <th className="p-4">Order ID</th>
                                <th className="p-4">Part Number</th>
                                <th className="p-4">Product Name</th>
                                <th className="p-4">Quantity</th>
                                <th className="p-4">Payment ID</th>
                                <th className="p-4">Address</th>
                                <th className="p-4">Customer Name</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Print</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={10} className="p-8 text-center text-gray-500">Loading orders...</td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="p-8 text-center text-gray-500">No orders found.</td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="p-4 font-medium dark:text-gray-200">
                                            #{order.orderNo}
                                        </td>
                                        <td className="p-4 text-gray-500 dark:text-gray-400 font-mono text-xs">
                                            {order.orderId || order.id}
                                        </td>
                                        <td className="p-4 text-gray-500 dark:text-gray-400 font-mono text-xs">
                                            {order.partNumber || '-'}
                                        </td>
                                        <td className="p-4 font-medium dark:text-gray-200 max-w-[200px] truncate">
                                            {order.productName || '-'}
                                        </td>
                                        <td className="p-4 dark:text-gray-200">
                                            {order.quantity || 1}
                                        </td>
                                        <td className="p-4 text-gray-500 dark:text-gray-400 font-mono text-xs max-w-[150px] truncate">
                                            {order.paymentId || '-'}
                                        </td>
                                        <td className="p-4 text-gray-500 dark:text-gray-400 max-w-[200px] truncate">
                                            {order.address || '-'}
                                        </td>
                                        <td className="p-4 font-medium dark:text-gray-200">
                                            {order.customerName || '-'}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${order.status === 'delivered' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                    order.status === 'shipped' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                        order.status === 'confirmed' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' :
                                                            order.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                                'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                }`}>
                                                {order.status || 'pending'}
                                            </span>
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
