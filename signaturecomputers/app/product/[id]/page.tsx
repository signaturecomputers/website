'use client';

import { useState } from 'react';
import { FiStar, FiShoppingCart, FiHeart, FiShare2 } from 'react-icons/fi';

export default function ProductDetailsPage() {
    const [activeTab, setActiveTab] = useState('description');
    const [quantity, setQuantity] = useState(1);

    // Dummy data
    const product = {
        name: 'MacBook Pro 16" M3 Max',
        brand: 'Apple',
        price: 3499,
        originalPrice: 3699,
        rating: 4.9,
        reviews: 128,
        description: 'The new MacBook Pro delivers game-changing performance for pro users. With the powerful M3 Max chip, it gets even more intense workloads done faster.',
        specs: {
            Processor: 'Apple M3 Max',
            RAM: '36GB Unified Memory',
            Storage: '1TB SSD',
            Screen: '16.2-inch Liquid Retina XDR',
            Battery: 'Up to 22 hours'
        },
        images: ['', '', '', ''] // Placeholders
    };

    return (
        <div className="bg-white dark:bg-black min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        <div className="aspect-square bg-gray-100 dark:bg-gray-900 rounded-2xl overflow-hidden flex items-center justify-center">
                            <span className="text-gray-400">Main Image</span>
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            {[0, 1, 2, 3].map((i) => (
                                <div key={i} className="aspect-square bg-gray-100 dark:bg-gray-900 rounded-lg cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all flex items-center justify-center">
                                    <span className="text-xs text-gray-400">Img {i + 1}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div>
                        <div className="mb-2">
                            <span className="text-blue-600 font-medium">{product.brand}</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{product.name}</h1>

                        <div className="flex items-center mb-6">
                            <div className="flex text-yellow-400 mr-2">
                                {[...Array(5)].map((_, i) => (
                                    <FiStar key={i} className={i < Math.floor(product.rating) ? "fill-current" : ""} />
                                ))}
                            </div>
                            <span className="text-sm text-gray-500">({product.reviews} reviews)</span>
                        </div>

                        <div className="flex items-end gap-4 mb-8">
                            <span className="text-4xl font-bold text-gray-900 dark:text-white">${product.price.toLocaleString()}</span>
                            {product.originalPrice && (
                                <span className="text-xl text-gray-500 line-through mb-1">${product.originalPrice.toLocaleString()}</span>
                            )}
                        </div>

                        <div className="space-y-6 border-t border-b border-gray-100 dark:border-gray-800 py-6 mb-8">
                            <div>
                                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Memory</h3>
                                <div className="flex gap-3">
                                    {['18GB', '36GB', '96GB'].map((ram) => (
                                        <button key={ram} className="px-4 py-2 border border-gray-300 rounded-md hover:border-blue-600 hover:text-blue-600 focus:ring-2 focus:ring-blue-500 transition-all dark:border-gray-700 dark:text-gray-300">
                                            {ram}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Storage</h3>
                                <div className="flex gap-3">
                                    {['512GB', '1TB', '2TB', '4TB'].map((storage) => (
                                        <button key={storage} className="px-4 py-2 border border-gray-300 rounded-md hover:border-blue-600 hover:text-blue-600 focus:ring-2 focus:ring-blue-500 transition-all dark:border-gray-700 dark:text-gray-300">
                                            {storage}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="flex items-center border border-gray-300 rounded-md dark:border-gray-700">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800">-</button>
                                <span className="px-4 py-3 font-medium border-l border-r border-gray-300 dark:border-gray-700">{quantity}</span>
                                <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800">+</button>
                            </div>
                            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-md flex items-center justify-center transition-colors">
                                <FiShoppingCart className="mr-2" /> Add to Cart
                            </button>
                            <button className="p-3 border border-gray-300 rounded-md hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                                <FiHeart className="text-xl" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mt-16">
                    <div className="border-b border-gray-200 dark:border-gray-800">
                        <nav className="-mb-px flex space-x-8">
                            {['description', 'specifications', 'reviews'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`${activeTab === tab
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </nav>
                    </div>
                    <div className="mt-8">
                        {activeTab === 'description' && (
                            <div className="prose dark:prose-invert max-w-none">
                                <p>{product.description}</p>
                                <p>More detailed description about the product features, build quality, and performance benchmarks would go here.</p>
                            </div>
                        )}
                        {activeTab === 'specifications' && (
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
                                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                    {Object.entries(product.specs).map(([key, value]) => (
                                        <div key={key}>
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{key}</dt>
                                            <dd className="mt-1 text-sm text-gray-900 dark:text-white font-semibold">{value}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </div>
                        )}
                        {activeTab === 'reviews' && (
                            <div>
                                <p className="text-gray-500">Customer reviews will appear here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
