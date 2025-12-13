"use client";

import { useEffect, useState } from "react";
import { collection, getCountFromServer } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";

export default function AdminDashboardHome() {
    const [stats, setStats] = useState({
        products: 0,
        orders: 0,
        users: 0,
        revenue: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                // Attempt to fetch counts. If collections don't exist, this might return 0 or error.
                // Simple count implementation using getCountFromServer (requires Firebase v9.11+)
                // If getting "AggregateField not found", might need to fallback.

                const categories = ['laptops', 'desktops', 'monitors', 'accessories', 'printers', 'cartridges', 'toners'];
                const productCounts = await Promise.all(
                    categories.map(cat =>
                        getCountFromServer(collection(db, cat))
                            .then(snap => snap.data().count)
                            .catch(() => 0)
                    )
                );

                const totalProducts = productCounts.reduce((a, b) => a + b, 0);

                const ordersColl = collection(db, "orders");
                const usersColl = collection(db, "users");

                const [ordersSnap, usersSnap] = await Promise.all([
                    getCountFromServer(ordersColl).catch(() => ({ data: () => ({ count: 0 }) })),
                    getCountFromServer(usersColl).catch(() => ({ data: () => ({ count: 0 }) })),
                ]);

                setStats({
                    products: totalProducts,
                    orders: ordersSnap.data().count,
                    users: usersSnap.data().count,
                    revenue: 0,
                });
            } catch (err) {
                console.error("Error fetching stats:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, []);

    const statCards = [
        { label: "Total Revenue", value: `$${stats.revenue}`, icon: DollarSign, color: "text-green-600 bg-green-100 dark:bg-green-900/20" },
        { label: "Orders", value: stats.orders, icon: ShoppingCart, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/20" },
        { label: "Products", value: stats.products, icon: Package, color: "text-indigo-600 bg-indigo-100 dark:bg-indigo-900/20" },
        { label: "Users", value: stats.users, icon: Users, color: "text-orange-600 bg-orange-100 dark:bg-orange-900/20" },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard Overview</h1>

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
                        <div className="mt-4 flex items-center text-sm text-green-600">
                            {/* Trend placeholder */}
                            <span>+0% this month</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <h2 className="mb-4 text-lg font-bold text-gray-800 dark:text-white">Recent Activity</h2>
                <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                    <p className="text-gray-500">No recent activity detected.</p>
                </div>
            </div>
        </div>
    );
}
