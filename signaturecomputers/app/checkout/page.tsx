'use client';

import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc, getDoc } from 'firebase/firestore';
import { toast } from 'sonner';

export default function CheckoutPage() {
    const { cart, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip: '',
    });

    // Pre-fill form with user data
    useEffect(() => {
        const loadUserData = async () => {
            if (user) {
                setFormData(prev => ({
                    ...prev,
                    name: user.displayName || '',
                    email: user.email || ''
                }));

                // Load saved address if exists
                const userRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userRef);
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    if (userData.shippingAddress) {
                        setFormData(prev => ({
                            ...prev,
                            phone: userData.phone || '',
                            address: userData.shippingAddress.addressLine1 || '',
                            city: userData.shippingAddress.city || '',
                            state: userData.shippingAddress.state || '',
                            zip: userData.shippingAddress.pincode || ''
                        }));
                    }
                }
            }
        };
        loadUserData();
    }, [user]);

    // Redirect if not logged in
    useEffect(() => {
        if (!user) {
            toast.error('Please login to checkout');
            router.push('/login');
        }
    }, [user, router]);

    if (cart.length === 0) {
        return <div className="p-8 text-center">Your cart is empty.</div>;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            toast.error('Please login to place order');
            return;
        }

        // Validate
        if (!formData.phone || formData.phone.length < 10) {
            toast.error('Please enter a valid phone number');
            return;
        }

        setLoading(true);
        try {
            // Format address
            const fullAddress = `${formData.address}, ${formData.city}, ${formData.state} - ${formData.zip}`;

            // Create order for each cart item
            for (const item of cart) {
                const orderData = {
                    orderId: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    productId: item.id,
                    productName: item.name,
                    partNumber: (item as any).partNumber || '',
                    quantity: item.quantity,
                    unitPrice: item.price,
                    totalAmount: item.price * item.quantity,
                    customerId: user.uid,
                    customerEmail: user.email,
                    customerName: formData.name,
                    phone: formData.phone,
                    address: fullAddress,
                    shippingAddress: {
                        addressLine1: formData.address,
                        city: formData.city,
                        state: formData.state,
                        pincode: formData.zip
                    },
                    paymentId: `PAY-${Date.now()}`,
                    paymentStatus: 'pending',
                    status: 'pending',
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                };

                await addDoc(collection(db, 'orders'), orderData);
            }

            // Save address for future orders
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, {
                phone: formData.phone,
                shippingAddress: {
                    addressLine1: formData.address,
                    city: formData.city,
                    state: formData.state,
                    pincode: formData.zip
                }
            }, { merge: true });

            toast.success('Order placed successfully!');
            clearCart();
            router.push('/');
        } catch (error) {
            console.error('Error placing order:', error);
            toast.error('Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-black min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Checkout</h1>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Shipping Form */}
                    <div>
                        <h2 className="text-xl font-semibold mb-6 dark:text-white">Shipping Address</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                                <input required name="name" value={formData.name} onChange={handleChange} type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 p-3" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                                <input required name="email" value={formData.email} onChange={handleChange} type="email" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 p-3" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                                <input required name="phone" value={formData.phone} onChange={handleChange} type="tel" maxLength={10} placeholder="10-digit phone number" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 p-3" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                                <input required name="address" value={formData.address} onChange={handleChange} type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 p-3" />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
                                    <input required name="city" value={formData.city} onChange={handleChange} type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 p-3" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">State</label>
                                    <input required name="state" value={formData.state} onChange={handleChange} type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 p-3" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pincode</label>
                                    <input required name="zip" value={formData.zip} onChange={handleChange} type="text" maxLength={6} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 p-3" />
                                </div>
                            </div>

                            <div className="pt-6">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                >
                                    {loading ? 'Placing Order...' : `Place Order (₹${cartTotal.toLocaleString()})`}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Order Summary Preview */}
                    <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl h-fit">
                        <h2 className="text-xl font-semibold mb-6 dark:text-white">Your Order</h2>
                        <ul className="divide-y divide-gray-200 dark:divide-gray-800">
                            {cart.map((item) => (
                                <li key={item.id} className="py-4 flex justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">₹{(item.price * item.quantity).toLocaleString()}</p>
                                </li>
                            ))}
                        </ul>
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-4 flex justify-between font-bold">
                            <span className="dark:text-white">Total</span>
                            <span className="text-blue-600">₹{cartTotal.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
