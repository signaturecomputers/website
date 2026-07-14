'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { FiArrowLeft, FiChevronRight, FiSearch } from 'react-icons/fi';

interface Product {
    id: string;
    name: string;
    brand: string;
    images?: string[];
    productInfo?: {
        partNo?: string;
    };
    category: string;
}

const CATEGORIES = [
    { id: 'laptops', name: 'Laptops' },
    { id: 'desktops', name: 'Desktops' },
    { id: 'workstations', name: 'Workstations' }
];

export default function CarePacksPage() {
    const [selectedCategory, setSelectedCategory] = useState('laptops');
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        async function fetchProducts() {
            setLoading(true);
            try {
                const snapshot = await getDocs(collection(db, selectedCategory));
                const fetchedProducts = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        name: data.name || 'Unnamed Product',
                        brand: data.brand || '',
                        images: data.images || [],
                        productInfo: data.productInfo || {},
                        category: selectedCategory
                    } as Product;
                });
                setProducts(fetchedProducts);
            } catch (err) {
                console.error("Failed to fetch category products: ", err);
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, [selectedCategory]);

    const filteredProducts = products.filter(product => {
        const name = product.name.toLowerCase();
        const brand = product.brand.toLowerCase();
        const partNo = (product.productInfo?.partNo || '').toLowerCase();
        const term = searchQuery.toLowerCase().trim();

        return name.includes(term) || brand.includes(term) || partNo.includes(term);
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/admindashboard/products"
                    className="p-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                    <FiArrowLeft className="text-gray-600 dark:text-gray-300" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold dark:text-white">Care Pack Assignment</h1>
                    <p className="text-sm text-gray-500">Select a product to manage its Care Packs</p>
                </div>
            </div>

            {/* Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => {
                            setSelectedCategory(cat.id);
                            setSearchQuery('');
                        }}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                            selectedCategory === cat.id
                                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-400 font-semibold'
                                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-blue-300'
                        }`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* Search & Filter */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder={`Search ${selectedCategory}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Products List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading products...</div>
                ) : filteredProducts.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No products found.</div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {filteredProducts.map((product) => (
                            <Link
                                key={product.id}
                                href={`/admindashboard/products/care-packs/assign/${product.id}`}
                                className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden flex items-center justify-center flex-shrink-0">
                                        {product.images?.[0] ? (
                                            <img
                                                src={product.images[0]}
                                                alt={product.name}
                                                className="w-full h-full object-contain p-1"
                                            />
                                        ) : (
                                            <span className="text-xs text-gray-400">No Img</span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900 dark:text-white">{product.name}</h3>
                                        <div className="flex gap-4 text-xs text-gray-500 mt-1">
                                            <span>Brand: <span className="font-medium text-gray-700 dark:text-gray-300">{product.brand}</span></span>
                                            <span>Part No: <span className="font-mono font-medium text-gray-700 dark:text-gray-300">{product.productInfo?.partNo || 'Not Set'}</span></span>
                                        </div>
                                    </div>
                                </div>
                                <FiChevronRight className="text-gray-400" />
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
