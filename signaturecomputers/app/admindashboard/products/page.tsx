'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { deleteProduct } from '@/lib/admin-actions';
import Link from 'next/link';
import { FiPlus, FiTrash2, FiEdit2, FiSearch, FiFilter, FiEye } from 'react-icons/fi';
import { toast } from 'sonner';

interface Product {
    id: string;
    name: string;
    brand: string;
    price: number;
    stock: number;
    images: string[];
    category?: string;
    [key: string]: any;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const categories = [
        { id: 'all', name: 'All Products' },
        { id: 'laptops', name: 'Laptops' },
        { id: 'desktops', name: 'Desktops' },
        { id: 'monitors', name: 'Monitors' },
        { id: 'accessories', name: 'Accessories' },
        { id: 'printers', name: 'Printers' },
        { id: 'cartridges', name: 'Cartridges' },
        { id: 'toners', name: 'Toners' },
    ];

    useEffect(() => {
        fetchProducts();
    }, [selectedCategory]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            if (selectedCategory === 'all') {
                // Fetch from all categories
                const allCategories = ['laptops', 'desktops', 'monitors', 'accessories', 'printers', 'cartridges', 'toners'];
                const allProducts: Product[] = [];

                await Promise.all(allCategories.map(async (category) => {
                    try {
                        const querySnapshot = await getDocs(collection(db, category));
                        querySnapshot.docs.forEach(doc => {
                            allProducts.push({
                                id: doc.id,
                                category: category,
                                ...doc.data()
                            } as Product);
                        });
                    } catch (err) {
                        console.warn(`Failed to fetch ${category}:`, err);
                    }
                }));

                setProducts(allProducts);
            } else {
                const querySnapshot = await getDocs(collection(db, selectedCategory));
                const productsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    category: selectedCategory,
                    ...doc.data()
                })) as Product[];
                setProducts(productsData);
            }
        } catch (error) {
            console.warn('Warning: Failed to fetch products (likely permissions):', error);
            toast.error('Failed to load products (check rules)');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (productId: string) => {
        if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;

        try {
            const result = await deleteProduct(selectedCategory, productId);
            if (result.success) {
                setProducts(prev => prev.filter(p => p.id !== productId));
                toast.success('Product deleted successfully');
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error('Failed to delete product');
        }
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold dark:text-white">Products</h1>
                <Link
                    href="/admindashboard/products/add"
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                    <FiPlus className="mr-2" />
                    Add Product
                </Link>
            </div>

            {/* Filters & Search */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <FiFilter className="text-gray-400" />
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="p-2 pr-8 rounded-lg border dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-medium">
                            <tr>
                                <th className="p-4 w-20">Image</th>
                                <th className="p-4">Product Name</th>
                                <th className="p-4">Part Number</th>
                                {selectedCategory === 'all' && <th className="p-4">Category</th>}
                                <th className="p-4">Brand</th>
                                <th className="p-4">Price</th>
                                <th className="p-4">Stock</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={selectedCategory === 'all' ? 8 : 7} className="p-8 text-center text-gray-500">Loading products...</td>
                                </tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={selectedCategory === 'all' ? 8 : 7} className="p-8 text-center text-gray-500">No products found{selectedCategory !== 'all' ? ` in ${selectedCategory}` : ''}.</td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="p-4">
                                            <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden flex items-center justify-center">
                                                {product.images?.[0] ? (
                                                    <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-xs text-gray-400">No Img</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 font-medium dark:text-gray-200">{product.name}</td>
                                        <td className="p-4 text-gray-500 dark:text-gray-400 font-mono text-xs">
                                            {product.productInfo?.partNo || '-'}
                                        </td>
                                        {selectedCategory === 'all' && (
                                            <td className="p-4">
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 capitalize">
                                                    {product.category}
                                                </span>
                                            </td>
                                        )}
                                        <td className="p-4 text-gray-500 dark:text-gray-400">{product.brand}</td>
                                        <td className="p-4 font-medium dark:text-gray-200">₹{product.price.toLocaleString()}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock > 5
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : product.stock > 0
                                                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                {product.stock} in stock
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/product/${product.id}`}
                                                    target="_blank"
                                                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg dark:hover:bg-blue-900/20 transition-colors"
                                                    title="View Product Page"
                                                >
                                                    <FiEye />
                                                </Link>
                                                <Link
                                                    href={`/admindashboard/products/edit/${product.id}`}
                                                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 transition-colors"
                                                    title="Edit Product"
                                                >
                                                    <FiEdit2 />
                                                </Link>

                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg dark:hover:bg-red-900/20 transition-colors"
                                                    title="Delete Product"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
