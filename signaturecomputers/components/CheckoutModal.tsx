'use client';

import { useState, useEffect, useCallback } from 'react';
import { FiX, FiShoppingBag, FiMapPin, FiUser, FiPhone, FiCreditCard } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc, setDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Script from 'next/script';

// Declare Cashfree types
declare global {
    interface Window {
        Cashfree: {
            checkout: {
                create: (config: { paymentSessionId: string }) => {
                    redirect: () => Promise<void>;
                };
            };
        };
    }
}

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: {
        id: string;
        name: string;
        price: number;
        category?: string;
        images?: string[];
        productInfo?: {
            partNo?: string;
        };
        [key: string]: unknown;
    };
    quantity: number;
}

interface ShippingAddress {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
}

export default function CheckoutModal({ isOpen, onClose, product, quantity }: CheckoutModalProps) {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [cashfreeLoaded, setCashfreeLoaded] = useState(false);
    const [step, setStep] = useState<'address' | 'confirm'>('address');
    const [address, setAddress] = useState<ShippingAddress>({
        fullName: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: ''
    });

    // Load saved address if available
    useEffect(() => {
        const loadUserAddress = async () => {
            if (user) {
                const userRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userRef);
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    if (userData.shippingAddress) {
                        setAddress(userData.shippingAddress);
                    }
                    // Pre-fill name and phone if available
                    if (userData.displayName && !address.fullName) {
                        setAddress(prev => ({
                            ...prev,
                            fullName: userData.displayName || '',
                            phone: userData.phone || ''
                        }));
                    }
                }
            }
        };
        if (isOpen) {
            loadUserAddress();
        }
    }, [user, isOpen]);

    if (!isOpen) return null;

    const totalAmount = product.price * quantity;

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setAddress(prev => ({ ...prev, [name]: value }));
    };

    const validateAddress = () => {
        if (!address.fullName.trim()) {
            toast.error('Please enter your full name');
            return false;
        }
        if (!address.phone.trim() || address.phone.length < 10) {
            toast.error('Please enter a valid phone number');
            return false;
        }
        if (!address.addressLine1.trim()) {
            toast.error('Please enter your address');
            return false;
        }
        if (!address.city.trim()) {
            toast.error('Please enter your city');
            return false;
        }
        if (!address.state.trim()) {
            toast.error('Please enter your state');
            return false;
        }
        if (!address.pincode.trim() || address.pincode.length !== 6) {
            toast.error('Please enter a valid 6-digit pincode');
            return false;
        }
        return true;
    };

    const handleProceedToConfirm = () => {
        if (validateAddress()) {
            setStep('confirm');
        }
    };

    // Create pending order in Firestore
    const createPendingOrder = async (cfOrderId: string) => {
        if (!user) return null;

        const addressString = `${address.addressLine1}${address.addressLine2 ? ', ' + address.addressLine2 : ''}, ${address.city}, ${address.state} - ${address.pincode}`;
        const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const orderData = {
            orderId,
            cfOrderId,
            productId: product.id,
            productName: product.name,
            productImage: product.images?.[0] || '',
            productCategory: product.category || '',
            partNumber: product.productInfo?.partNo || '',
            quantity: quantity,
            unitPrice: product.price,
            totalAmount: totalAmount,
            customerId: user.uid,
            customerEmail: user.email,
            customerName: address.fullName,
            phone: address.phone,
            address: addressString,
            shippingAddress: address,
            paymentStatus: 'pending',
            status: 'pending',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        await addDoc(collection(db, 'orders'), orderData);

        // Save address to user profile
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
            shippingAddress: address,
            phone: address.phone
        }, { merge: true });

        return orderId;
    };

    // Cashfree Online Payment
    const handleOnlinePayment = async () => {
        if (!user) {
            toast.error('Please login to place order');
            return;
        }

        if (!cashfreeLoaded) {
            toast.error('Payment gateway is loading. Please wait...');
            return;
        }

        setPaymentLoading(true);
        try {
            const cfOrderId = `CF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            // Create pending order in Firestore
            await createPendingOrder(cfOrderId);

            // Create Cashfree order
            const response = await fetch('/api/cashfree/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: totalAmount,
                    customer_id: user.uid,
                    email: user.email,
                    phone: address.phone,
                    customer_name: address.fullName,
                    order_id: cfOrderId
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create payment order');
            }

            // Store order info in sessionStorage for return page
            sessionStorage.setItem('pendingCfOrder', JSON.stringify({
                cfOrderId,
                productName: product.name
            }));

            // Initialize Cashfree checkout
            const cashfree = window.Cashfree.checkout.create({
                paymentSessionId: data.payment_session_id
            });

            onClose();
            await cashfree.redirect();

        } catch (error) {
            console.error('Payment initiation error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to initiate payment');
        } finally {
            setPaymentLoading(false);
        }
    };

    // COD Order
    const handleCODOrder = async () => {
        if (!user) {
            toast.error('Please login to place order');
            return;
        }

        setLoading(true);
        try {
            const addressString = `${address.addressLine1}${address.addressLine2 ? ', ' + address.addressLine2 : ''}, ${address.city}, ${address.state} - ${address.pincode}`;

            const orderData = {
                orderId: `ORD-${Date.now()}`,
                productId: product.id,
                productName: product.name,
                productImage: product.images?.[0] || '',
                productCategory: product.category || '',
                partNumber: product.productInfo?.partNo || '',
                quantity: quantity,
                unitPrice: product.price,
                totalAmount: totalAmount,
                customerId: user.uid,
                customerEmail: user.email,
                customerName: address.fullName,
                phone: address.phone,
                address: addressString,
                shippingAddress: address,
                paymentMethod: 'COD',
                paymentStatus: 'pending',
                status: 'pending',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            await addDoc(collection(db, 'orders'), orderData);

            // Save address to user profile
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, {
                shippingAddress: address,
                phone: address.phone
            }, { merge: true });

            toast.success('Order placed successfully!');
            onClose();
            router.push('/profile');
        } catch (error) {
            console.error('Error placing order:', error);
            toast.error('Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Load Cashfree SDK */}
            <Script
                src="https://sdk.cashfree.com/js/v3/cashfree.js"
                onLoad={() => setCashfreeLoaded(true)}
                strategy="afterInteractive"
            />

            <div className="fixed inset-0 z-50 flex items-center justify-center">
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Modal */}
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 flex items-center justify-between z-10">
                        <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                            <FiShoppingBag className="text-blue-600" />
                            {step === 'address' ? 'Shipping Address' : 'Confirm Order'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                        >
                            <FiX className="text-xl" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {step === 'address' ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                                            <FiUser className="inline mr-1" /> Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={address.fullName}
                                            onChange={handleAddressChange}
                                            placeholder="Enter your full name"
                                            className="w-full p-3 rounded-lg border dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                                            <FiPhone className="inline mr-1" /> Phone Number *
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={address.phone}
                                            onChange={handleAddressChange}
                                            placeholder="10-digit phone number"
                                            maxLength={10}
                                            className="w-full p-3 rounded-lg border dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                                            <FiMapPin className="inline mr-1" /> Address Line 1 *
                                        </label>
                                        <input
                                            type="text"
                                            name="addressLine1"
                                            value={address.addressLine1}
                                            onChange={handleAddressChange}
                                            placeholder="House/Flat No., Building, Street"
                                            className="w-full p-3 rounded-lg border dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                                            Address Line 2
                                        </label>
                                        <input
                                            type="text"
                                            name="addressLine2"
                                            value={address.addressLine2}
                                            onChange={handleAddressChange}
                                            placeholder="Landmark, Area (optional)"
                                            className="w-full p-3 rounded-lg border dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">City *</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={address.city}
                                            onChange={handleAddressChange}
                                            placeholder="City"
                                            className="w-full p-3 rounded-lg border dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">State *</label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={address.state}
                                            onChange={handleAddressChange}
                                            placeholder="State"
                                            className="w-full p-3 rounded-lg border dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Pincode *</label>
                                        <input
                                            type="text"
                                            name="pincode"
                                            value={address.pincode}
                                            onChange={handleAddressChange}
                                            placeholder="6-digit pincode"
                                            maxLength={6}
                                            className="w-full p-3 rounded-lg border dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleProceedToConfirm}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors mt-4"
                                >
                                    Continue to Confirm
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Order Summary */}
                                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                    <h3 className="font-semibold mb-3 dark:text-white">Order Summary</h3>
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-medium dark:text-gray-200">{product.name}</p>
                                            {product.productInfo?.partNo && (
                                                <p className="text-sm text-gray-500">Part No: {product.productInfo.partNo}</p>
                                            )}
                                        </div>
                                        <p className="font-medium dark:text-white">x{quantity}</p>
                                    </div>
                                    <div className="border-t dark:border-gray-700 pt-2 mt-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                                            <span className="dark:text-white">₹{totalAmount.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-lg mt-2">
                                            <span className="dark:text-white">Total</span>
                                            <span className="text-blue-600">₹{totalAmount.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Shipping Address */}
                                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-semibold dark:text-white">Shipping Address</h3>
                                        <button
                                            onClick={() => setStep('address')}
                                            className="text-blue-600 text-sm hover:underline"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                    <p className="text-sm dark:text-gray-300">{address.fullName}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{address.phone}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {address.addressLine1}
                                        {address.addressLine2 && `, ${address.addressLine2}`}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {address.city}, {address.state} - {address.pincode}
                                    </p>
                                </div>

                                {/* Payment Options */}
                                <div className="space-y-3">
                                    <h3 className="font-semibold dark:text-white">Payment Method</h3>

                                    {/* Pay Online Button */}
                                    <button
                                        onClick={handleOnlinePayment}
                                        disabled={paymentLoading || loading || !cashfreeLoaded}
                                        className="w-full flex items-center justify-center py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                                                <FiCreditCard className="mr-2" />
                                                Pay Online ₹{totalAmount.toLocaleString()}
                                            </>
                                        )}
                                    </button>

                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                                        </div>
                                        <div className="relative flex justify-center text-sm">
                                            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">OR</span>
                                        </div>
                                    </div>

                                    {/* COD Button */}
                                    <button
                                        onClick={handleCODOrder}
                                        disabled={loading || paymentLoading}
                                        className="w-full flex items-center justify-center py-3 px-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Placing Order...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                                Cash on Delivery
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Back button */}
                                <button
                                    onClick={() => setStep('address')}
                                    className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    ← Back to Address
                                </button>

                                {/* Payment info */}
                                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                    🔒 Secure payments powered by Cashfree
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
