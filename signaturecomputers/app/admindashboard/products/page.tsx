'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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

interface CategoryData {
    id: string;
    name: string; // Display name
    parentId?: string | null;
    group?: string | null; // For UI grouping
    deleted?: boolean;
    isCustom?: boolean;
}

const DEFAULT_CATEGORIES: CategoryData[] = [
    { id: 'all', name: 'All Products', group: null }, // Special case for filter
    { id: 'laptops', name: 'Laptops', group: null },
    { id: 'probook', name: 'ProBook', group: null },
    { id: 'zbook-firefly', name: 'ZBook Firefly', group: null },
    { id: 'elitebook', name: 'EliteBook', group: null },
    { id: 'desktops', name: 'Desktops', group: null },
    { id: 'workstations', name: 'Workstations', group: null },
    { id: 'monitors', name: 'Monitors', group: null },
    { id: 'cctv', name: 'CCTV', group: null },
    // Memory, Storage & Graphics group
    { id: 'memory', name: 'Memory', group: 'Memory, Storage & Graphics' },
    { id: 'storage', name: 'Storage', group: 'Memory, Storage & Graphics' },
    { id: 'graphics-cards', name: 'Graphics Cards', group: 'Memory, Storage & Graphics' },
    // Accessories group
    { id: 'keyboards', name: 'Keyboards', group: 'Accessories' },
    { id: 'headphones', name: 'Headphones', group: 'Accessories' },
    { id: 'cables', name: 'Cables', group: 'Accessories' },
    { id: 'power-adapters', name: 'Power Adapters', group: 'Accessories' },
    { id: 'mouse', name: 'Mouse', group: 'Accessories' },
    { id: 'keyboard-mouse-combo', name: 'Keyboard & Mouse Combo', group: 'Accessories' },
    { id: 'bags', name: 'Bags', group: 'Accessories' },
    { id: 'docks', name: 'Docks', group: 'Accessories' },
    { id: 'hubs', name: 'Hubs', group: 'Accessories' },
    { id: 'usb-flashdrives', name: 'USB Flash Drives', group: 'Accessories' },
    { id: 'dvd-writers', name: 'DVD Writer', group: 'Accessories' },
    { id: 'webcams', name: 'Webcam', group: 'Accessories' },
];

export default function ProductsPage() {
    const searchParams = useSearchParams();
    const categoryFromUrl = searchParams.get('category');

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl || 'all');
    const [searchQuery, setSearchQuery] = useState('');
    const [categories, setCategories] = useState<CategoryData[]>(DEFAULT_CATEGORIES);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [categories]);

    const mapParentToGroup = (parentId: string | undefined | null) => {
        if (!parentId) return null;
        if (parentId === 'printers-group' || parentId === 'memory-storage-group') return 'Memory, Storage & Graphics';
        if (parentId === 'accessories') return 'Accessories';
        return parentId;
    };

    const fetchCategories = async () => {
        try {
            const customCatsSnapshot = await getDocs(collection(db, 'custom_categories'));
            const customCategories = customCatsSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    name: data.name,
                    parentId: data.parentId,
                    group: mapParentToGroup(data.parentId),
                    isCustom: true,
                    deleted: false
                };
            });

            const metadataSnapshot = await getDocs(collection(db, 'category_metadata'));
            const metadataMap: Record<string, { name?: string, deleted?: boolean }> = {};
            metadataSnapshot.docs.forEach(doc => {
                const data = doc.data();
                metadataMap[doc.id] = { name: data.name, deleted: data.deleted };
            });

            const mergedCategories = [
                ...DEFAULT_CATEGORIES,
                ...customCategories
            ].map(cat => {
                const meta = metadataMap[cat.id];
                return {
                    ...cat,
                    name: cat.id === 'dvd-writers' ? 'DVD Writer' : (meta?.name || cat.name), // Force dvd-writers to 'DVD Writer'
                    deleted: meta?.deleted || false
                };
            }).filter(cat => !cat.deleted || cat.id === 'all'); // Always keep 'all'

            setCategories(mergedCategories);

        } catch (error) {
            console.error('Failed to fetch categories:', error);
            // Fallback to default, but ensure 'all' is there
            setCategories(DEFAULT_CATEGORIES);
        }
    };

    const fetchProducts = async () => {
        if (categories.length === 1 && categories[0].id === 'all' && loading) {
            return;
        }

        setLoading(true);
        try {
            // Fetch from all known categories (excluding virtual category IDs like webcams and parent accessories)
            const allCategoryIds = categories
                .filter(c => c.id !== 'all' && c.id !== 'accessories' && c.id !== 'webcams' && c.id !== 'probook' && c.id !== 'zbook-firefly' && c.id !== 'elitebook')
                .map(c => c.id);
            // Remove duplicates if any
            const uniqueCategoryIds = Array.from(new Set(allCategoryIds));

            const allProducts: Product[] = [];

            await Promise.all(uniqueCategoryIds.map(async (category) => {
                try {
                    const querySnapshot = await getDocs(collection(db, category));
                    querySnapshot.docs.forEach(doc => {
                        const data = doc.data();
                        let productCat = data.category || category;

                        // Dynamically resolve category for admin panel based on name
                        if (productCat === 'laptops' || productCat === 'probook' || productCat === 'zbook-firefly' || productCat === 'elitebook') {
                            const nameLower = (data.name || '').toLowerCase();
                            if (nameLower.includes('hp probook')) {
                                productCat = 'probook';
                            } else if (nameLower.includes('zbook firefly')) {
                                productCat = 'zbook-firefly';
                            } else if (nameLower.includes('elitebook')) {
                                productCat = 'elitebook';
                            } else {
                                productCat = 'laptops';
                            }
                        }

                        allProducts.push({
                            id: doc.id,
                            ...data,
                            category: productCat
                        } as Product);
                    });
                } catch (err) {
                    // Ignore errors for collections that might not exist yet or empty
                }
            }));

            setProducts(allProducts);
        } catch (error) {
            console.warn('Warning: Failed to fetch products (likely permissions):', error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (productId: string, productCategory: string) => {
        if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;

        // Use the product's actual category, not selectedCategory (which could be 'all')
        let categoryToDelete = productCategory || selectedCategory;

        if (categoryToDelete === 'probook' || categoryToDelete === 'zbook-firefly' || categoryToDelete === 'elitebook') {
            categoryToDelete = 'laptops';
        }

        if (categoryToDelete === 'all') {
            toast.error('Cannot delete product: unknown category');
            return;
        }

        // Get admin session from sessionStorage
        const adminSession = sessionStorage.getItem('admin_user');
        if (!adminSession) {
            toast.error('Admin session expired. Please login again.');
            return;
        }

        try {
            // Use API route for deletion (works on Vercel with Firebase Admin SDK)
            // Pass admin session in Authorization header
            const response = await fetch('/api/admin/products/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${btoa(adminSession)}` // Base64 encode the session
                },
                body: JSON.stringify({ category: categoryToDelete, productId }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setProducts(prev => prev.filter(p => p.id !== productId));
                toast.success('Product deleted successfully');
            } else {
                throw new Error(result.error || 'Failed to delete product');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to delete product');
        }
    };

    const getProductCountForCategory = (catId: string) => {
        let count = 0;
        products.forEach(p => {
            if (p.stock <= 0) return; // Skip if stock is 0 (out of stock)
            
            if (catId === 'all') {
                count++;
                return;
            }
            
            if (catId === 'webcams') {
                if (p.category === 'webcams' || p.productInfo?.othersType === 'webcam') {
                    count++;
                }
            } else if (catId === 'dvd-writers') {
                if (p.category === 'dvd-writers' && p.productInfo?.othersType !== 'webcam') {
                    count++;
                }
            } else {
                if (p.category === catId) {
                    count++;
                }
            }
        });
        return count;
    };

    const filteredProducts = products.filter(product => {
        // 1. Category Filter
        if (selectedCategory !== 'all') {
            if (selectedCategory === 'webcams') {
                if (product.category !== 'webcams' && product.productInfo?.othersType !== 'webcam') {
                    return false;
                }
            } else if (selectedCategory === 'dvd-writers') {
                if (product.category !== 'dvd-writers' || product.productInfo?.othersType === 'webcam') {
                    return false;
                }
            } else {
                if (product.category !== selectedCategory) return false;
            }
        }

        // 2. Search Query Filter
        const query = searchQuery.toLowerCase();
        return (
            product.name.toLowerCase().includes(query) ||
            product.brand.toLowerCase().includes(query) ||
            (product.productInfo?.partNo || '').toLowerCase().includes(query)
        );
    });

    // Get unique groups for optgroups
    const groups = Array.from(new Set(categories.map(c => c.group))).filter(Boolean) as string[];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold dark:text-white">Products</h1>
                <div className="flex gap-2">
                    <Link
                        href="/admindashboard/products/care-packs"
                        className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                    >
                        <FiPlus className="mr-2" />
                        Add Care Pack
                    </Link>
                    <Link
                        href={selectedCategory && selectedCategory !== 'all' ? `/admindashboard/products/add?category=${selectedCategory}` : "/admindashboard/products/add"}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        <FiPlus className="mr-2" />
                        Add Product
                    </Link>
                </div>
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
                        {/* Always show "All Products" first */}
                        <option value="all">All Products ({getProductCountForCategory('all')} nos)</option>

                        {categories
                            .filter(cat => cat.id !== 'all' && cat.id !== 'accessories')
                            .map(cat => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name} ({getProductCountForCategory(cat.id)} nos)
                                </option>
                            ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] text-left text-sm">
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
                                                    {categories.find(c => c.id === product.category)?.name || product.category}
                                                </span>
                                            </td>
                                        )}
                                        <td className="p-4 text-gray-500 dark:text-gray-400">{product.brand}</td>
                                        <td className="p-4 font-medium dark:text-gray-200">₹{product.price.toLocaleString('en-IN')}</td>
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
                                                    onClick={() => handleDelete(product.id, product.category || selectedCategory)}
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
