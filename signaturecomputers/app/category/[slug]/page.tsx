'use client';

import { useParams } from 'next/navigation';
import SidebarFilters from '@/components/SidebarFilters';
import ProductCard from '@/components/ProductCard';
import { useState } from 'react';

// Dummy data for testing
const dummyProducts = [
    { id: '1', name: 'MacBook Pro 16"', brand: 'Apple', price: 2499, originalPrice: 2699, image: '', rating: 5 },
    { id: '2', name: 'Dell XPS 15', brand: 'Dell', price: 1899, originalPrice: 2099, image: '', rating: 4.5 },
    { id: '3', name: 'ThinkPad X1 Carbon', brand: 'Lenovo', price: 1599, originalPrice: 1799, image: '', rating: 4.8 },
    { id: '4', name: 'HP Spectre x360', brand: 'HP', price: 1499, originalPrice: 1699, image: '', rating: 4.6 },
    { id: '5', name: 'Asus ROG Zephyrus', brand: 'Asus', price: 1999, originalPrice: 2199, image: '', rating: 4.7 },
    { id: '6', name: 'MacBook Air M2', brand: 'Apple', price: 1199, originalPrice: 1299, image: '', rating: 4.9 },
];

export default function CategoryPage() {
    const params = useParams();
    const slug = params.slug;
    const [sortBy, setSortBy] = useState('newest');

    // Format slug for title
    const title = typeof slug === 'string'
        ? slug.charAt(0).toUpperCase() + slug.slice(1)
        : 'Category';

    return (
        <div className="bg-gray-50 dark:bg-black min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="w-full md:w-64 flex-shrink-0">
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 sticky top-24">
                            <SidebarFilters />
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">Sort by:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="newest">Newest</option>
                                    <option value="price_low">Price: Low to High</option>
                                    <option value="price_high">Price: High to Low</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {dummyProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>

                        {/* Pagination Placeholder */}
                        <div className="mt-12 flex justify-center">
                            <nav className="flex space-x-2">
                                <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">Previous</button>
                                <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium">1</button>
                                <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">2</button>
                                <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">Next</button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
