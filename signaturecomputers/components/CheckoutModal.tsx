'use client';

import { useState, useEffect } from 'react';
import { FiX, FiShoppingBag, FiMapPin, FiUser, FiPhone, FiCreditCard, FiPlus, FiCheck, FiTrash2, FiEdit2 } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
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
    windowsInstallation?: boolean;
    windowsInstallationPrice?: number;
}

interface BillingAddress {
    id: string;
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    isDefault?: boolean;
}

export default function CheckoutModal({ isOpen, onClose, product, quantity, windowsInstallation, windowsInstallationPrice }: CheckoutModalProps) {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [cashfreeLoaded, setCashfreeLoaded] = useState(false);
    const [step, setStep] = useState<'address' | 'confirm'>('address');

    // Multiple addresses state
    const [savedAddresses, setSavedAddresses] = useState<BillingAddress[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [loadingAddresses, setLoadingAddresses] = useState(true);

    // New address form
    const [newAddress, setNewAddress] = useState<Omit<BillingAddress, 'id'>>({
        fullName: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: ''
    });

    // Load saved addresses
    useEffect(() => {
        const loadUserAddresses = async () => {
            if (user) {
                setLoadingAddresses(true);
                try {
                    const userRef = doc(db, 'users', user.uid);
                    const userDoc = await getDoc(userRef);
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        const addresses = userData.billingAddresses || [];
                        setSavedAddresses(addresses);

                        // Select default or first address
                        const defaultAddr = addresses.find((a: BillingAddress) => a.isDefault);
                        if (defaultAddr) {
                            setSelectedAddressId(defaultAddr.id);
                        } else if (addresses.length > 0) {
                            setSelectedAddressId(addresses[0].id);
                        }

                        // Pre-fill new address form with user info
                        if (userData.displayName) {
                            setNewAddress(prev => ({
                                ...prev,
                                fullName: userData.displayName || '',
                                phone: userData.phone || ''
                            }));
                        }

                        // If no saved addresses, show the add form
                        if (addresses.length === 0) {
                            setShowAddForm(true);
                        }
                    } else {
                        setShowAddForm(true);
                    }
                } catch (error) {
                    console.error('Error loading addresses:', error);
                    setShowAddForm(true);
                } finally {
                    setLoadingAddresses(false);
                }
            }
        };
        if (isOpen) {
            loadUserAddresses();
        }
    }, [user, isOpen]);

    if (!isOpen) return null;

    const productTotal = product.price * quantity;
    const windowsTotal = windowsInstallation && windowsInstallationPrice ? windowsInstallationPrice * quantity : 0;
    const totalAmount = productTotal + windowsTotal;
    const selectedAddress = savedAddresses.find(a => a.id === selectedAddressId);

    const handleNewAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewAddress(prev => ({ ...prev, [name]: value }));
    };

    const validateNewAddress = () => {
        if (!newAddress.fullName.trim()) {
            toast.error('Please enter your full name');
            return false;
        }
        if (!newAddress.phone.trim() || newAddress.phone.length < 10) {
            toast.error('Please enter a valid phone number');
            return false;
        }
        if (!newAddress.addressLine1.trim()) {
            toast.error('Please enter your address');
            return false;
        }
        if (!newAddress.city.trim()) {
            toast.error('Please enter your city');
            return false;
        }
        if (!newAddress.state.trim()) {
            toast.error('Please enter your state');
            return false;
        }
        if (!newAddress.pincode.trim() || newAddress.pincode.length !== 6) {
            toast.error('Please enter a valid 6-digit pincode');
            return false;
        }
        return true;
    };

    const handleAddNewAddress = async () => {
        if (!validateNewAddress()) return;
        if (!user) return;

        try {
            const addressId = `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const addressData: BillingAddress = {
                id: addressId,
                ...newAddress,
                isDefault: savedAddresses.length === 0 // First address is default
            };

            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                billingAddresses: arrayUnion(addressData)
            }).catch(async () => {
                // Document might not exist, create it
                await setDoc(userRef, {
                    billingAddresses: [addressData]
                }, { merge: true });
            });

            setSavedAddresses(prev => [...prev, addressData]);
            setSelectedAddressId(addressId);
            setShowAddForm(false);
            setNewAddress({
                fullName: '',
                phone: '',
                addressLine1: '',
                addressLine2: '',
                city: '',
                state: '',
                pincode: ''
            });
            toast.success('Address added successfully!');
        } catch (error) {
            console.error('Error adding address:', error);
            toast.error('Failed to add address');
        }
    };

    const handleDeleteAddress = async (addressId: string) => {
        if (!user) return;

        const addressToDelete = savedAddresses.find(a => a.id === addressId);
        if (!addressToDelete) return;

        if (!confirm('Are you sure you want to delete this address?')) return;

        try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                billingAddresses: arrayRemove(addressToDelete)
            });

            setSavedAddresses(prev => prev.filter(a => a.id !== addressId));
            if (selectedAddressId === addressId) {
                const remaining = savedAddresses.filter(a => a.id !== addressId);
                setSelectedAddressId(remaining.length > 0 ? remaining[0].id : null);
            }
            toast.success('Address deleted');
        } catch (error) {
            console.error('Error deleting address:', error);
            toast.error('Failed to delete address');
        }
    };

    const handleProceedToConfirm = () => {
        if (!selectedAddress && !showAddForm) {
            toast.error('Please select or add an address');
            return;
        }
        if (showAddForm) {
            if (!validateNewAddress()) return;
            // Save address first, then proceed
            handleAddNewAddress().then(() => {
                setStep('confirm');
            });
        } else {
            setStep('confirm');
        }
    };

    // Create pending order in Firestore
    const createPendingOrder = async (cfOrderId: string) => {
        if (!user || !selectedAddress) return null;

        // Generate uniform order ID: SC-YYYYMMDD-XXXX
        const now = new Date();
        const dateStr = now.getFullYear().toString() +
            (now.getMonth() + 1).toString().padStart(2, '0') +
            now.getDate().toString().padStart(2, '0');
        const randomPart = Math.floor(1000 + Math.random() * 9000);
        const orderId = `SC-${dateStr}-${randomPart}`;
        const fullAddress = `${selectedAddress.addressLine1}${selectedAddress.addressLine2 ? ', ' + selectedAddress.addressLine2 : ''}, ${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode}`;

        const orderData: any = {
            orderId,
            cfOrderId,
            productId: product.id,
            productName: product.name,
            productImage: product.images?.[0] || '',
            productCategory: product.category || '',
            partNumber: product.productInfo?.partNo || '',
            quantity: quantity,
            unitPrice: product.price,
            windowsInstallation: windowsInstallation || false,
            totalAmount: totalAmount,
            customerId: user.uid,
            customerEmail: user.email,
            customerName: selectedAddress.fullName,
            phone: selectedAddress.phone,
            address: fullAddress,
            shippingAddress: {
                addressLine1: selectedAddress.addressLine1,
                addressLine2: selectedAddress.addressLine2,
                city: selectedAddress.city,
                state: selectedAddress.state,
                pincode: selectedAddress.pincode
            },
            paymentMethod: 'online',
            paymentStatus: 'pending',
            status: 'pending',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        // Only add windowsInstallationPrice if it exists
        if (windowsInstallation && windowsInstallationPrice) {
            orderData.windowsInstallationPrice = windowsInstallationPrice;
        }

        await addDoc(collection(db, 'orders'), orderData);

        return orderId;
    };

    // Cashfree Online Payment (Primary method - no COD)
    const handleOnlinePayment = async () => {
        if (!user) {
            toast.error('Please login to place order');
            return;
        }

        if (!selectedAddress) {
            toast.error('Please select a billing address');
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
                    phone: selectedAddress.phone,
                    customer_name: selectedAddress.fullName,
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
                            {step === 'address' ? 'Billing Address' : 'Confirm Order'}
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
                                {loadingAddresses ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : (
                                    <>
                                        {/* Saved Addresses */}
                                        {savedAddresses.length > 0 && !showAddForm && (
                                            <div className="space-y-3">
                                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Select a billing address:
                                                </p>
                                                {savedAddresses.map((addr) => (
                                                    <div
                                                        key={addr.id}
                                                        className={`relative border rounded-lg p-4 cursor-pointer transition-all ${selectedAddressId === addr.id
                                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                                                            }`}
                                                        onClick={() => setSelectedAddressId(addr.id)}
                                                    >
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex items-start gap-3">
                                                                <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedAddressId === addr.id
                                                                    ? 'border-blue-600 bg-blue-600'
                                                                    : 'border-gray-300'
                                                                    }`}>
                                                                    {selectedAddressId === addr.id && (
                                                                        <FiCheck className="text-white text-xs" />
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <p className="font-semibold dark:text-white">{addr.fullName}</p>
                                                                    <p className="text-sm text-gray-600 dark:text-gray-400">{addr.phone}</p>
                                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                        {addr.addressLine1}
                                                                        {addr.addressLine2 && `, ${addr.addressLine2}`}
                                                                    </p>
                                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                        {addr.city}, {addr.state} - {addr.pincode}
                                                                    </p>
                                                                    {addr.isDefault && (
                                                                        <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                                                                            Default
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteAddress(addr.id);
                                                                }}
                                                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                            >
                                                                <FiTrash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}

                                                {/* Add New Address Button */}
                                                <button
                                                    onClick={() => setShowAddForm(true)}
                                                    className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-600 transition-colors"
                                                >
                                                    <FiPlus /> Add New Address
                                                </button>
                                            </div>
                                        )}

                                        {/* Add New Address Form */}
                                        {showAddForm && (
                                            <div className="space-y-4">
                                                {savedAddresses.length > 0 && (
                                                    <button
                                                        onClick={() => setShowAddForm(false)}
                                                        className="text-sm text-blue-600 hover:underline"
                                                    >
                                                        ← Back to saved addresses
                                                    </button>
                                                )}
                                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Add new billing address:
                                                </p>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="col-span-2">
                                                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                                                            <FiUser className="inline mr-1" /> Full Name *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="fullName"
                                                            value={newAddress.fullName}
                                                            onChange={handleNewAddressChange}
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
                                                            value={newAddress.phone}
                                                            onChange={handleNewAddressChange}
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
                                                            value={newAddress.addressLine1}
                                                            onChange={handleNewAddressChange}
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
                                                            value={newAddress.addressLine2}
                                                            onChange={handleNewAddressChange}
                                                            placeholder="Landmark, Area (optional)"
                                                            className="w-full p-3 rounded-lg border dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">City *</label>
                                                        <input
                                                            type="text"
                                                            name="city"
                                                            value={newAddress.city}
                                                            onChange={handleNewAddressChange}
                                                            placeholder="City"
                                                            className="w-full p-3 rounded-lg border dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">State *</label>
                                                        <input
                                                            type="text"
                                                            name="state"
                                                            value={newAddress.state}
                                                            onChange={handleNewAddressChange}
                                                            placeholder="State"
                                                            className="w-full p-3 rounded-lg border dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    </div>
                                                    <div className="col-span-2">
                                                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Pincode *</label>
                                                        <input
                                                            type="text"
                                                            name="pincode"
                                                            value={newAddress.pincode}
                                                            onChange={handleNewAddressChange}
                                                            placeholder="6-digit pincode"
                                                            maxLength={6}
                                                            className="w-full p-3 rounded-lg border dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}

                                <button
                                    onClick={handleProceedToConfirm}
                                    disabled={!selectedAddressId && !showAddForm}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Product Price</span>
                                            <span className="dark:text-white">₹{productTotal.toLocaleString('en-IN')}</span>
                                        </div>
                                        {windowsInstallation && windowsInstallationPrice && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">Windows 11 Pro OEM Key</span>
                                                <span className="dark:text-white">₹{windowsTotal.toLocaleString('en-IN')}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t dark:border-gray-700">
                                            <span className="dark:text-white">Grand Total</span>
                                            <span className="text-blue-600">₹{totalAmount.toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Billing Address */}
                                {selectedAddress && (
                                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="font-semibold dark:text-white">Billing Address</h3>
                                            <button
                                                onClick={() => setStep('address')}
                                                className="text-blue-600 text-sm hover:underline"
                                            >
                                                Change
                                            </button>
                                        </div>
                                        <p className="text-sm dark:text-gray-300">{selectedAddress.fullName}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{selectedAddress.phone}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {selectedAddress.addressLine1}
                                            {selectedAddress.addressLine2 && `, ${selectedAddress.addressLine2}`}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                                        </p>
                                    </div>
                                )}

                                {/* Payment - Only Online Payment */}
                                <div className="space-y-3">
                                    <h3 className="font-semibold dark:text-white">Payment Method</h3>

                                    {/* Pay Online Button - Primary and only option */}
                                    <button
                                        onClick={handleOnlinePayment}
                                        disabled={paymentLoading || !cashfreeLoaded}
                                        className="w-full flex items-center justify-center py-4 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                                                Pay ₹{totalAmount.toLocaleString('en-IN')}
                                            </>
                                        )}
                                    </button>

                                    {/* Payment methods info */}
                                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                                        Pay securely via UPI, Credit/Debit Card, or Net Banking
                                    </p>
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
