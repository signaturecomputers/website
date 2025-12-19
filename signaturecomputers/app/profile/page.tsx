'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FiPackage, FiUser, FiLogOut, FiLoader, FiShoppingBag } from 'react-icons/fi';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';

interface Order {
    id: string;
    orderId: string;
    productName: string;
    quantity: number;
    totalAmount: number;
    status: string;
    createdAt: any;
    shippingAddress?: {
        addressLine1?: string;
        city?: string;
        state?: string;
        pincode?: string;
    };
}

interface UserProfile {
    displayName?: string;
    email?: string;
    phoneNumber?: string;
    firstName?: string;
    lastName?: string;
}

export default function ProfilePage() {
    const { user, loading: authLoading, logout } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [loadingProfile, setLoadingProfile] = useState(true);

    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login?redirect=/profile');
        }
    }, [user, authLoading, router]);

    // Fetch user profile from Firestore
    useEffect(() => {
        async function fetchUserProfile() {
            if (!user) return;

            try {
                const userRef = doc(db, 'users', user.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    setUserProfile(userSnap.data() as UserProfile);
                } else {
                    // Use Firebase Auth data if Firestore data doesn't exist
                    setUserProfile({
                        displayName: user.displayName || undefined,
                        email: user.email || undefined,
                    });
                }
            } catch (error) {
                console.error('Error fetching user profile:', error);
                setUserProfile({
                    displayName: user.displayName || undefined,
                    email: user.email || undefined,
                });
            } finally {
                setLoadingProfile(false);
            }
        }

        if (user) {
            fetchUserProfile();
        }
    }, [user]);

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
                        productName: data.productName || 'Unknown Product',
                        quantity: data.quantity || 1,
                        totalAmount: data.totalAmount || 0,
                        status: data.status || 'pending',
                        createdAt: data.createdAt,
                        shippingAddress: data.shippingAddress,
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
                setLoadingOrders(false);
            }
        }

        if (user) {
            fetchOrders();
        }
    }, [user]);

    if (authLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
                <FiLoader className="text-4xl text-blue-600 animate-spin" />
            </div>
        );
    }

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'N/A';
        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            return date.toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch {
            return 'N/A';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'delivered':
                return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'shipped':
                return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'processing':
                return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'cancelled':
                return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'pending':
            default:
                return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    const displayName = userProfile?.firstName && userProfile?.lastName
        ? `${userProfile.firstName} ${userProfile.lastName}`
        : userProfile?.displayName || user.displayName || 'User';

    return (
        <div className="bg-gray-50 dark:bg-black min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">My Account</h1>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Sidebar Info */}
                    <div className="md:col-span-1">
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 text-center">
                            {loadingProfile ? (
                                <div className="flex justify-center py-8">
                                    <FiLoader className="text-2xl text-blue-600 animate-spin" />
                                </div>
                            ) : (
                                <>
                                    <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-blue-600">
                                        {displayName[0]?.toUpperCase() || <FiUser />}
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{displayName}</h2>
                                    <p className="text-sm text-gray-500 mb-2">{userProfile?.email || user.email}</p>
                                    {userProfile?.phoneNumber && (
                                        <p className="text-sm text-gray-500 mb-4">{userProfile.phoneNumber}</p>
                                    )}
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-md hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-900/20 transition-colors mt-4"
                                    >
                                        <FiLogOut /> Sign Out
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Orders & Main Content */}
                    <div className="md:col-span-3">
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                                <FiPackage className="text-blue-600 text-xl" />
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Order History</h2>
                            </div>

                            {loadingOrders ? (
                                <div className="flex justify-center py-12">
                                    <FiLoader className="text-3xl text-blue-600 animate-spin" />
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="text-center py-12">
                                    <FiShoppingBag className="text-5xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                    <p className="text-gray-500 text-lg">No orders yet</p>
                                    <p className="text-gray-400 text-sm mt-1">Start shopping to see your orders here!</p>
                                    <button
                                        onClick={() => router.push('/')}
                                        className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
                                    >
                                        Browse Products
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {orders.map((order) => (
                                        <div key={order.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <span className="font-bold text-gray-900 dark:text-white text-sm">{order.orderId}</span>
                                                    <span className="text-xs text-gray-500 block">{formatDate(order.createdAt)}</span>
                                                </div>
                                                <span className={`px-2 py-1 text-xs font-bold rounded-full capitalize ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                {order.productName} {order.quantity > 1 && `(x${order.quantity})`}
                                            </div>
                                            {order.shippingAddress && (
                                                <div className="text-xs text-gray-400 mb-2">
                                                    Shipping to: {order.shippingAddress.city}, {order.shippingAddress.state}
                                                </div>
                                            )}
                                            <div className="text-right font-bold text-gray-900 dark:text-white">
                                                Total: ₹{order.totalAmount.toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
