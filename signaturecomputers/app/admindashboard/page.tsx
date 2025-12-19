"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { IndianRupee, Package, ShoppingCart, Users, TrendingUp, TrendingDown, Calendar, Clock } from "lucide-react";

interface DashboardStats {
    products: number;
    orders: number;
    users: number;
    revenue: number;
    monthlyRevenue: number;
    previousMonthRevenue: number;
    todayOrders: number;
    pendingOrders: number;
}

interface RecentOrder {
    id: string;
    orderId: string;
    customerName: string;
    productName: string;
    totalAmount: number;
    status: string;
    createdAt: any;
}

export default function AdminDashboardHome() {
    const [stats, setStats] = useState<DashboardStats>({
        products: 0,
        orders: 0,
        users: 0,
        revenue: 0,
        monthlyRevenue: 0,
        previousMonthRevenue: 0,
        todayOrders: 0,
        pendingOrders: 0,
    });
    const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                // Product categories to count
                const categories = [
                    'laptops', 'desktops', 'monitors', 'printers', 'cartridges', 'toners',
                    'keyboards', 'mouse', 'keyboard-mouse-combo', 'headphones', 'cables',
                    'power-adapters', 'bags', 'docks', 'usb-flashdrives', 'dvd-writers',
                    'workstations', 'cctv'
                ];

                // Fetch product counts from all categories
                const productCounts = await Promise.all(
                    categories.map(async cat => {
                        try {
                            const snapshot = await getDocs(collection(db, cat));
                            return snapshot.docs.length;
                        } catch {
                            return 0;
                        }
                    })
                );
                const totalProducts = productCounts.reduce((a, b) => a + b, 0);

                // Fetch orders and calculate revenue
                const ordersSnapshot = await getDocs(collection(db, "orders"));
                const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                // Calculate total revenue
                let totalRevenue = 0;
                let monthlyRevenue = 0;
                let previousMonthRevenue = 0;
                let todayOrders = 0;
                let pendingOrders = 0;

                const now = new Date();
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
                const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

                orders.forEach((order: any) => {
                    const amount = order.totalAmount || (order.unitPrice * (order.quantity || 1)) || 0;
                    totalRevenue += amount;

                    // Get order date
                    let orderDate: Date | null = null;
                    if (order.createdAt) {
                        orderDate = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
                    }

                    if (orderDate) {
                        // Monthly revenue
                        if (orderDate >= startOfMonth) {
                            monthlyRevenue += amount;
                        }
                        // Previous month revenue
                        if (orderDate >= startOfPrevMonth && orderDate <= endOfPrevMonth) {
                            previousMonthRevenue += amount;
                        }
                        // Today's orders
                        if (orderDate >= startOfToday) {
                            todayOrders++;
                        }
                    }

                    // Pending orders
                    if (order.status === 'pending' || !order.status) {
                        pendingOrders++;
                    }
                });

                // Fetch users count
                const usersSnapshot = await getDocs(collection(db, "users"));

                // Get recent orders for activity
                const sortedOrders = orders
                    .sort((a: any, b: any) => {
                        const dateA = a.createdAt?.toDate?.() || new Date(0);
                        const dateB = b.createdAt?.toDate?.() || new Date(0);
                        return dateB.getTime() - dateA.getTime();
                    })
                    .slice(0, 5)
                    .map((order: any) => ({
                        id: order.id,
                        orderId: order.orderId || order.id,
                        customerName: order.customerName || 'Unknown',
                        productName: order.productName || 'Unknown Product',
                        totalAmount: order.totalAmount || (order.unitPrice * (order.quantity || 1)) || 0,
                        status: order.status || 'pending',
                        createdAt: order.createdAt,
                    }));

                setRecentOrders(sortedOrders);
                setStats({
                    products: totalProducts,
                    orders: orders.length,
                    users: usersSnapshot.docs.length,
                    revenue: totalRevenue,
                    monthlyRevenue,
                    previousMonthRevenue,
                    todayOrders,
                    pendingOrders,
                });
            } catch (err) {
                console.error("Error fetching stats:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, []);

    const formatCurrency = (amount: number) => {
        return `₹${amount.toLocaleString('en-IN')}`;
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return '-';
        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            return date.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return '-';
        }
    };

    const getGrowthPercentage = () => {
        if (stats.previousMonthRevenue === 0) return stats.monthlyRevenue > 0 ? 100 : 0;
        return Math.round(((stats.monthlyRevenue - stats.previousMonthRevenue) / stats.previousMonthRevenue) * 100);
    };

    const growthPercentage = getGrowthPercentage();

    const statCards = [
        {
            label: "Total Revenue",
            value: formatCurrency(stats.revenue),
            icon: IndianRupee,
            color: "text-green-600 bg-green-100 dark:bg-green-900/20",
            subtext: `This month: ${formatCurrency(stats.monthlyRevenue)}`
        },
        {
            label: "Orders",
            value: stats.orders,
            icon: ShoppingCart,
            color: "text-blue-600 bg-blue-100 dark:bg-blue-900/20",
            subtext: `${stats.pendingOrders} pending`
        },
        {
            label: "Products",
            value: stats.products,
            icon: Package,
            color: "text-indigo-600 bg-indigo-100 dark:bg-indigo-900/20",
            subtext: "Across all categories"
        },
        {
            label: "Users",
            value: stats.users,
            icon: Users,
            color: "text-orange-600 bg-orange-100 dark:bg-orange-900/20",
            subtext: "Registered customers"
        },
    ];

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'delivered': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'shipped': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'confirmed': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400';
            case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard Overview</h1>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>Today: {stats.todayOrders} orders</span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((card, idx) => (
                    <div key={idx} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.label}</p>
                                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                                    {loading ? "..." : card.value}
                                </p>
                            </div>
                            <div className={`rounded-full p-3 ${card.color}`}>
                                <card.icon className="h-6 w-6" />
                            </div>
                        </div>
                        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                            {card.subtext}
                        </div>
                    </div>
                ))}
            </div>

            {/* Growth & Quick Stats */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Monthly Growth */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white">Monthly Growth</h2>
                        <div className={`flex items-center gap-1 text-sm font-medium ${growthPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {growthPercentage >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            <span>{growthPercentage >= 0 ? '+' : ''}{growthPercentage}%</span>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 dark:text-gray-400">This Month</span>
                            <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(stats.monthlyRevenue)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 dark:text-gray-400">Last Month</span>
                            <span className="font-medium text-gray-600 dark:text-gray-300">{formatCurrency(stats.previousMonthRevenue)}</span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${growthPercentage >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                                style={{ width: `${Math.min(Math.abs(growthPercentage), 100)}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Quick Stats</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                            <p className="text-sm text-blue-600 dark:text-blue-400">Today's Orders</p>
                            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.todayOrders}</p>
                        </div>
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                            <p className="text-sm text-yellow-600 dark:text-yellow-400">Pending</p>
                            <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{stats.pendingOrders}</p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                            <p className="text-sm text-green-600 dark:text-green-400">Total Products</p>
                            <p className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.products}</p>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                            <p className="text-sm text-purple-600 dark:text-purple-400">Customers</p>
                            <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{stats.users}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">Recent Orders</h2>
                    <a href="/admindashboard/orders" className="text-sm text-blue-600 hover:underline">View All →</a>
                </div>

                {loading ? (
                    <div className="flex h-32 items-center justify-center">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : recentOrders.length === 0 ? (
                    <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                        <p className="text-gray-500">No orders yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="text-gray-500 dark:text-gray-400">
                                <tr className="border-b dark:border-gray-700">
                                    <th className="text-left py-3 px-2 font-medium">Order ID</th>
                                    <th className="text-left py-3 px-2 font-medium">Customer</th>
                                    <th className="text-left py-3 px-2 font-medium">Product</th>
                                    <th className="text-left py-3 px-2 font-medium">Amount</th>
                                    <th className="text-left py-3 px-2 font-medium">Status</th>
                                    <th className="text-left py-3 px-2 font-medium">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y dark:divide-gray-700">
                                {recentOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="py-3 px-2 font-mono text-xs">{order.orderId.slice(0, 15)}...</td>
                                        <td className="py-3 px-2 font-medium dark:text-gray-200">{order.customerName}</td>
                                        <td className="py-3 px-2 text-gray-600 dark:text-gray-400 max-w-[150px] truncate">{order.productName}</td>
                                        <td className="py-3 px-2 font-medium dark:text-gray-200">{formatCurrency(order.totalAmount)}</td>
                                        <td className="py-3 px-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-2 text-gray-500 dark:text-gray-400">{formatDate(order.createdAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
