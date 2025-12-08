'use client';

import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
    const { cart, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: user?.displayName || '',
        email: user?.email || '',
        address: '',
        city: '',
        state: '',
        zip: '',
    });

    if (cart.length === 0) {
        // Redirect or show empty (ideally done in useEffect)
        return <div className="p-8 text-center">Your cart is empty.</div>;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate order placement
        alert('Order Placed Successfully! (Simulation)');
        clearCart();
        router.push('/');
    };

    return (
        <div className="bg-white dark:bg-black min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Checkout</h1>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Shipping Form */}
                    <div>
                        <h2 className="text-xl font-semibold mb-6">Shipping Address</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                                <input required name="name" value={formData.name} onChange={handleChange} type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                                <input required name="email" value={formData.email} onChange={handleChange} type="email" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                                <input required name="address" value={formData.address} onChange={handleChange} type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700" />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
                                    <input required name="city" value={formData.city} onChange={handleChange} type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">State</label>
                                    <input required name="state" value={formData.state} onChange={handleChange} type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Zip Code</label>
                                    <input required name="zip" value={formData.zip} onChange={handleChange} type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700" />
                                </div>
                            </div>

                            <div className="pt-6">
                                <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                    Place Order (${cartTotal.toLocaleString()})
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Order Summary Preview */}
                    <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl h-fit">
                        <h2 className="text-xl font-semibold mb-6">Your Order</h2>
                        <ul className="divide-y divide-gray-200 dark:divide-gray-800">
                            {cart.map((item) => (
                                <li key={item.id} className="py-4 flex justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">${(item.price * item.quantity).toLocaleString()}</p>
                                </li>
                            ))}
                        </ul>
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-4 flex justify-between font-bold">
                            <span>Total</span>
                            <span>${cartTotal.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
