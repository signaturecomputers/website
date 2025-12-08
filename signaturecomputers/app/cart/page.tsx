'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { FiTrash2, FiArrowLeft } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();
    const router = useRouter();

    if (cart.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Your Cart is Empty</h2>
                <p className="text-gray-500 mb-8">Looks like you haven't added anything yet.</p>
                <Link href="/" className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-black min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Shopping Cart ({cartCount})</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-8">
                        {cart.map((item) => (
                            <div key={item.id} className="flex gap-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800">
                                <div className="h-24 w-24 bg-white dark:bg-black rounded-md flex-shrink-0 flex items-center justify-center">
                                    {/* Image Placeholder */}
                                    {item.image ? (
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-md" />
                                    ) : (
                                        <span className="text-xs text-gray-400">No Img</span>
                                    )}
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{item.name}</h3>
                                        <p className="text-blue-600 font-bold">${item.price.toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-md">
                                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 py-1 hover:bg-gray-200 dark:hover:bg-gray-800">-</button>
                                            <span className="px-3 py-1 text-sm font-medium">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-1 hover:bg-gray-200 dark:hover:bg-gray-800">+</button>
                                        </div>
                                        <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700">
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-500 mt-4">
                            <FiArrowLeft className="mr-2" /> Continue Shopping
                        </Link>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800 h-fit">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Order Summary</h2>
                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                                <span className="font-medium text-gray-900 dark:text-white">${cartTotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                                <span className="text-green-600">Free</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Tax</span>
                                <span className="font-medium text-gray-900 dark:text-white">$0.00</span>
                            </div>
                            <div className="border-t border-gray-200 dark:border-gray-800 pt-4 flex justify-between text-lg font-bold">
                                <span className="text-gray-900 dark:text-white">Total</span>
                                <span className="text-blue-600">${cartTotal.toLocaleString()}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => router.push('/checkout')}
                            className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-md transition-colors shadow-lg"
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
