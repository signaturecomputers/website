'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FiPackage, FiUser, FiLogOut } from 'react-icons/fi';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function ProfilePage() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    // Fetch orders (simulated for now since no real checkout processing saved to DB yet)
    useEffect(() => {
        if (user) {
            // In a real app, we would fetch from 'orders' collection
            // const q = query(collection(db, 'orders'), where('userId', '==', user.uid));
            // ... fetch docs

            // Setting dummy orders for visualization
            setOrders([
                { id: 'ORD-12345', date: '2023-11-20', total: 2599, status: 'Delivered', items: ['MacBook Pro'] },
                { id: 'ORD-67890', date: '2023-12-05', total: 199, status: 'Processing', items: ['Wireless Mouse', 'USB-C Hub'] }
            ]);
        }
    }, [user]);

    if (loading || !user) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    return (
        <div className="bg-gray-50 dark:bg-black min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">My Account</h1>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Sidebar Info */}
                    <div className="md:col-span-1">
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 text-center">
                            <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-blue-600">
                                {user.displayName ? user.displayName[0] : <FiUser />}
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user.displayName || 'User'}</h2>
                            <p className="text-sm text-gray-500 mb-6">{user.email}</p>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-md hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-900/20 transition-colors"
                            >
                                <FiLogOut /> Sign Out
                            </button>
                        </div>
                    </div>

                    {/* Orders & Main Content */}
                    <div className="md:col-span-3">
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                                <FiPackage className="text-blue-600 text-xl" />
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Order History</h2>
                            </div>

                            <div className="space-y-4">
                                {orders.map((order) => (
                                    <div key={order.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <span className="font-bold text-gray-900 dark:text-white text-sm">{order.id}</span>
                                                <span className="text-xs text-gray-500 block">{order.date}</span>
                                            </div>
                                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                            {order.items.join(', ')}
                                        </div>
                                        <div className="text-right font-bold text-gray-900 dark:text-white">
                                            Total: ${order.total.toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
