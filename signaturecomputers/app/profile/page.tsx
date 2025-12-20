'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FiPackage, FiUser, FiLogOut, FiLoader, FiShoppingBag, FiPhone, FiMail, FiMapPin, FiEdit2, FiCalendar, FiCheck, FiX } from 'react-icons/fi';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { toast } from 'sonner';

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
    phone?: string;
    firstName?: string;
    lastName?: string;
    shippingAddress?: {
        addressLine1?: string;
        city?: string;
        state?: string;
        pincode?: string;
    };
    createdAt?: any;
}

export default function ProfilePage() {
    const { user, loading: authLoading, logout } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [loadingProfile, setLoadingProfile] = useState(true);

    // Address editing state
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [savingAddress, setSavingAddress] = useState(false);
    const [addressForm, setAddressForm] = useState({
        phone: '',
        addressLine1: '',
        city: '',
        state: '',
        pincode: '',
    });

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

    const startEditingAddress = () => {
        setAddressForm({
            phone: userProfile?.phone || userProfile?.phoneNumber || '',
            addressLine1: userProfile?.shippingAddress?.addressLine1 || '',
            city: userProfile?.shippingAddress?.city || '',
            state: userProfile?.shippingAddress?.state || '',
            pincode: userProfile?.shippingAddress?.pincode || '',
        });
        setIsEditingAddress(true);
    };

    const cancelEditingAddress = () => {
        setIsEditingAddress(false);
    };

    const saveAddress = async () => {
        if (!user) return;

        if (!addressForm.addressLine1 || !addressForm.city || !addressForm.state || !addressForm.pincode) {
            toast.error('Please fill in all address fields');
            return;
        }

        setSavingAddress(true);
        try {
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, {
                phone: addressForm.phone,
                shippingAddress: {
                    addressLine1: addressForm.addressLine1,
                    city: addressForm.city,
                    state: addressForm.state,
                    pincode: addressForm.pincode,
                }
            }, { merge: true });

            // Update local state
            setUserProfile(prev => prev ? {
                ...prev,
                phone: addressForm.phone,
                shippingAddress: {
                    addressLine1: addressForm.addressLine1,
                    city: addressForm.city,
                    state: addressForm.state,
                    pincode: addressForm.pincode,
                }
            } : null);

            toast.success('Address updated successfully!');
            setIsEditingAddress(false);
        } catch (error) {
            console.error('Error saving address:', error);
            toast.error('Failed to save address');
        } finally {
            setSavingAddress(false);
        }
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Info Card */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* User Avatar & Basic Info */}
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                            {loadingProfile ? (
                                <div className="flex justify-center py-8">
                                    <FiLoader className="text-2xl text-blue-600 animate-spin" />
                                </div>
                            ) : (
                                <>
                                    <div className="text-center mb-6">
                                        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                                            {displayName[0]?.toUpperCase() || <FiUser />}
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{displayName}</h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Customer</p>
                                    </div>

                                    {/* Contact Details */}
                                    <div className="space-y-3 border-t border-gray-100 dark:border-gray-800 pt-4">
                                        <div className="flex items-center gap-3 text-sm">
                                            <FiMail className="text-gray-400 w-4 h-4 flex-shrink-0" />
                                            <span className="text-gray-700 dark:text-gray-300 truncate">{userProfile?.email || user.email}</span>
                                        </div>
                                        {(userProfile?.phone || userProfile?.phoneNumber) && (
                                            <div className="flex items-center gap-3 text-sm">
                                                <FiPhone className="text-gray-400 w-4 h-4 flex-shrink-0" />
                                                <span className="text-gray-700 dark:text-gray-300">{userProfile.phone || userProfile.phoneNumber}</span>
                                            </div>
                                        )}
                                        {userProfile?.createdAt && (
                                            <div className="flex items-center gap-3 text-sm">
                                                <FiCalendar className="text-gray-400 w-4 h-4 flex-shrink-0" />
                                                <span className="text-gray-700 dark:text-gray-300">
                                                    Member since {userProfile.createdAt?.toDate ?
                                                        userProfile.createdAt.toDate().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) :
                                                        'N/A'
                                                    }
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-900/20 transition-colors mt-6"
                                    >
                                        <FiLogOut /> Sign Out
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Shipping Address Card */}
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <FiMapPin className="text-blue-600" />
                                    Shipping Address
                                </h3>
                                {!isEditingAddress && !loadingProfile && (
                                    <button
                                        onClick={startEditingAddress}
                                        className="text-blue-600 hover:text-blue-700 p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                        title="Edit Address"
                                    >
                                        <FiEdit2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {loadingProfile ? (
                                <div className="flex justify-center py-4">
                                    <FiLoader className="text-xl text-blue-600 animate-spin" />
                                </div>
                            ) : isEditingAddress ? (
                                /* Edit Address Form */
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Phone Number</label>
                                        <input
                                            type="tel"
                                            value={addressForm.phone}
                                            onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                                            placeholder="Enter phone number"
                                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Address *</label>
                                        <input
                                            type="text"
                                            value={addressForm.addressLine1}
                                            onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                                            placeholder="House/Flat No., Street, Area"
                                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">City *</label>
                                            <input
                                                type="text"
                                                value={addressForm.city}
                                                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                                placeholder="City"
                                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">State *</label>
                                            <input
                                                type="text"
                                                value={addressForm.state}
                                                onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                                                placeholder="State"
                                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Pincode *</label>
                                        <input
                                            type="text"
                                            value={addressForm.pincode}
                                            onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                                            placeholder="Pincode"
                                            maxLength={6}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <button
                                            onClick={saveAddress}
                                            disabled={savingAddress}
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors"
                                        >
                                            {savingAddress ? (
                                                <FiLoader className="animate-spin" />
                                            ) : (
                                                <FiCheck />
                                            )}
                                            Save
                                        </button>
                                        <button
                                            onClick={cancelEditingAddress}
                                            disabled={savingAddress}
                                            className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <FiX />
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : userProfile?.shippingAddress ? (
                                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                    <p className="font-medium text-gray-900 dark:text-white">{displayName}</p>
                                    {(userProfile.phone || userProfile.phoneNumber) && (
                                        <p>{userProfile.phone || userProfile.phoneNumber}</p>
                                    )}
                                    <p>{userProfile.shippingAddress.addressLine1}</p>
                                    <p>
                                        {userProfile.shippingAddress.city}
                                        {userProfile.shippingAddress.state && `, ${userProfile.shippingAddress.state}`}
                                        {userProfile.shippingAddress.pincode && ` - ${userProfile.shippingAddress.pincode}`}
                                    </p>
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <FiMapPin className="text-3xl text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500 dark:text-gray-400">No shipping address saved</p>
                                    <button
                                        onClick={startEditingAddress}
                                        className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                                    >
                                        Add Address
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Quick Links */}
                        <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                            <Link
                                href="/orders"
                                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                <span className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                    <FiPackage className="text-blue-600" />
                                    My Orders
                                </span>
                                <span className="text-gray-400">→</span>
                            </Link>
                            <Link
                                href="/cart"
                                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                <span className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                    <FiShoppingBag className="text-blue-600" />
                                    Shopping Cart
                                </span>
                                <span className="text-gray-400">→</span>
                            </Link>
                        </div>
                    </div>

                    {/* Orders & Main Content */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                            <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                                <div className="flex items-center gap-2">
                                    <FiPackage className="text-blue-600 text-xl" />
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Order History</h2>
                                </div>
                                <Link href="/orders" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                    View All →
                                </Link>
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
