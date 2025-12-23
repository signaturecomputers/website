'use client';

import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc, getDoc } from 'firebase/firestore';
import { getProductById } from '@/lib/products';
import { toast } from 'sonner';
import { load } from '@cashfreepayments/cashfree-js';

// Cashfree SDK type
type CashfreeSDK = Awaited<ReturnType<typeof load>>;

interface PendingOrder {
    orderId: string;
    cfOrderId: string;
    productId: string;
    productName: string;
    productImage: string;
    productCategory: string;
    partNumber: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
}

export default function CheckoutPage() {
    const { cart, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const cashfreeRef = useRef<CashfreeSDK | null>(null);
    const [cashfreeLoaded, setCashfreeLoaded] = useState(false);
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

    // Initialize Cashfree SDK
    useEffect(() => {
        const initCashfree = async () => {
            try {
                const cashfree = await load({
                    mode: process.env.NEXT_PUBLIC_CASHFREE_ENV === 'PRODUCTION' ? 'production' : 'sandbox'
                });
                cashfreeRef.current = cashfree;
                setCashfreeLoaded(true);
                console.log('Cashfree SDK loaded successfully');
            } catch (error) {
                console.error('Failed to load Cashfree SDK:', error);
                toast.error('Failed to load payment gateway');
            }
        };
        initCashfree();
    }, []);

    const validateStock = useCallback(async () => {
        for (const item of cart) {
            const product = await getProductById(item.id);
            if (!product) {
                toast.error(`Product ${item.name} not found. Please refresh and try again.`);
                return false;
            }
            if (product.stock < item.quantity) {
                toast.error(`Insufficient stock for ${item.name}. Only ${product.stock} available.`);
                return false;
            }
        }
        return true;
    }, [cart]);

    const createPendingOrders = async (): Promise<{ orders: PendingOrder[], cfOrderId: string } | null> => {
        if (!user) return null;

        const cfOrderId = `CF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const pendingOrders: PendingOrder[] = [];

        for (const item of cart) {
            const product = await getProductById(item.id);
            if (!product) continue;

            // Generate uniform order ID: SC-YYYYMMDD-XXXX
            const now = new Date();
            const dateStr = now.getFullYear().toString() +
                (now.getMonth() + 1).toString().padStart(2, '0') +
                now.getDate().toString().padStart(2, '0');
            const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
            const orderId = `SC-${dateStr}-${randomPart}`;
            const fullAddress = `${formData.address}, ${formData.city}, ${formData.state} - ${formData.zip}`;

            const orderData = {
                orderId,
                cfOrderId, // Link to Cashfree order
                productId: item.id,
                productName: item.name,
                productImage: item.image || '',
                productCategory: product.category,
                partNumber: (item as { partNumber?: string }).partNumber || product.productInfo?.partNo || '',
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
                paymentMethod: 'online',
                paymentStatus: 'pending',
                status: 'pending',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            // Create the pending order
            await addDoc(collection(db, 'orders'), orderData);

            pendingOrders.push({
                orderId,
                cfOrderId,
                productId: item.id,
                productName: item.name,
                productImage: item.image || '',
                productCategory: product.category,
                partNumber: (item as { partNumber?: string }).partNumber || product.productInfo?.partNo || '',
                quantity: item.quantity,
                unitPrice: item.price,
                totalAmount: item.price * item.quantity
            });
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

        return { orders: pendingOrders, cfOrderId };
    };

    const initiateCashfreePayment = async () => {
        if (!user || !cashfreeLoaded) {
            toast.error('Payment gateway not ready. Please try again.');
            return;
        }

        // Validate form
        if (!formData.phone || formData.phone.length < 10) {
            toast.error('Please enter a valid phone number');
            return;
        }

        if (!formData.address || !formData.city || !formData.state || !formData.zip) {
            toast.error('Please fill in complete shipping address');
            return;
        }

        setPaymentLoading(true);

        try {
            // Validate stock first
            const stockValid = await validateStock();
            if (!stockValid) {
                setPaymentLoading(false);
                return;
            }

            // Create pending orders in Firestore
            const result = await createPendingOrders();
            if (!result) {
                toast.error('Failed to create order. Please try again.');
                setPaymentLoading(false);
                return;
            }

            // Create Cashfree order
            const response = await fetch('/api/cashfree/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: cartTotal,
                    customer_id: user.uid,
                    email: formData.email || user.email,
                    phone: formData.phone,
                    order_id: result.cfOrderId
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create payment order');
            }

            // Store order info in sessionStorage for return page
            sessionStorage.setItem('pendingCfOrder', JSON.stringify({
                cfOrderId: result.cfOrderId,
                orders: result.orders
            }));

            // Initialize Cashfree checkout using the SDK
            if (!cashfreeRef.current) {
                throw new Error('Payment gateway not initialized');
            }

            const checkoutOptions = {
                paymentSessionId: data.payment_session_id,
                redirectTarget: '_self' as const,
            };

            // Trigger checkout
            cashfreeRef.current.checkout(checkoutOptions).then((result: { error?: { message: string }; redirect?: boolean; paymentDetails?: { paymentMessage: string } }) => {
                if (result.error) {
                    console.error('Checkout error:', result.error);
                    toast.error(result.error.message || 'Payment failed');
                    setPaymentLoading(false);
                }
                if (result.redirect) {
                    console.log('Payment redirecting...');
                }
                if (result.paymentDetails) {
                    console.log('Payment completed:', result.paymentDetails.paymentMessage);
                }
            });

        } catch (error) {
            console.error('Payment initiation error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to initiate payment');
            setPaymentLoading(false);
        }
    };


    if (cart.length === 0) {
        return <div className="p-8 text-center">Your cart is empty.</div>;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <>

            <div className="bg-white dark:bg-black min-h-screen py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Checkout</h1>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Billing Address Form */}
                        <div>
                            <h2 className="text-xl font-semibold mb-6 dark:text-white">Billing Address</h2>
                            <form onSubmit={(e) => { e.preventDefault(); initiateCashfreePayment(); }} className="space-y-6">
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

                                {/* Payment Options */}
                                <div className="pt-6 space-y-4">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Payment Method</h3>

                                    {/* Pay Online Button */}
                                    <button
                                        type="button"
                                        onClick={initiateCashfreePayment}
                                        disabled={paymentLoading || loading || !cashfreeLoaded}
                                        className="w-full flex items-center justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                    >
                                        {paymentLoading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Processing...
                                            </>
                                        ) : !cashfreeLoaded ? (
                                            'Loading Payment Gateway...'
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                </svg>
                                                Pay ₹{cartTotal.toLocaleString()}
                                            </>
                                        )}
                                    </button>

                                    {/* Payment methods info */}
                                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                                        Pay securely via UPI, Credit/Debit Card, or Net Banking
                                    </p>
                                </div>

                                {/* Payment Methods Info */}
                                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                        🔒 Secure payments powered by Cashfree • UPI • Cards • Net Banking • Wallets
                                    </p>
                                </div>
                            </form>
                        </div>

                        {/* Order Summary Preview */}
                        <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl h-fit sticky top-24">
                            <h2 className="text-xl font-semibold mb-6 dark:text-white">Your Order</h2>
                            <ul className="divide-y divide-gray-200 dark:divide-gray-800 max-h-[400px] overflow-y-auto">
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
                            <div className="border-t border-gray-200 dark:border-gray-800 pt-4 mt-4">
                                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
                                    <span>Subtotal</span>
                                    <span>₹{cartTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
                                    <span>Shipping</span>
                                    <span className="text-green-500">FREE</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <span className="dark:text-white">Total</span>
                                    <span className="text-blue-600">₹{cartTotal.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
