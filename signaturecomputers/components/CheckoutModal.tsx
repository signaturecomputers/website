'use client';

import { useState, useEffect } from 'react';
import { FiX, FiShoppingBag, FiMapPin, FiUser, FiPhone } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc, setDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: {
        id: string;
        name: string;
        price: number;
        productInfo?: {
            partNo?: string;
        };
        [key: string]: any;
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

    const handlePlaceOrder = async () => {
        if (!user) {
            toast.error('Please login to place order');
            return;
        }

        setLoading(true);
        try {
            // Format address as string
            const addressString = `${address.addressLine1}${address.addressLine2 ? ', ' + address.addressLine2 : ''}, ${address.city}, ${address.state} - ${address.pincode}`;

            // Create order document
            const orderData = {
                // Order identifiers
                orderId: `ORD-${Date.now()}`,

                // Product info
                productId: product.id,
                productName: product.name,
                partNumber: product.productInfo?.partNo || '',
                quantity: quantity,
                unitPrice: product.price,
                totalAmount: totalAmount,

                // Customer info
                customerId: user.uid,
                customerEmail: user.email,
                customerName: address.fullName,
                phone: address.phone,
                address: addressString,
                shippingAddress: address,

                // Payment (placeholder - can be integrated with payment gateway)
                paymentId: `PAY-${Date.now()}`,
                paymentStatus: 'pending',

                // Order status
                status: 'pending',

                // Timestamps
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            // Save order to Firestore
            await addDoc(collection(db, 'orders'), orderData);

            // Save address to user profile for future orders
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, {
                shippingAddress: address,
                phone: address.phone
            }, { merge: true });

            toast.success('Order placed successfully!');
            onClose();

            // Optionally redirect to orders page
            // router.push('/account/orders');
        } catch (error) {
            console.error('Error placing order:', error);
            toast.error('Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 flex items-center justify-between">
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

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep('address')}
                                    className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold py-3 px-6 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={loading}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Placing Order...' : 'Place Order'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
