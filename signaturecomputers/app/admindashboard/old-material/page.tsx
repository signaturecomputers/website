'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { 
    FiTrash2, 
    FiEdit2, 
    FiSearch, 
    FiFilter, 
    FiEye, 
    FiCheck, 
    FiX, 
    FiArchive, 
    FiRefreshCw, 
    FiAlertCircle,
    FiArrowLeft,
    FiPlusCircle
} from 'react-icons/fi';
import { toast } from 'sonner';
import { updateProductStock, restoreFromOldMaterial } from '@/lib/admin-actions';
import { isProductOldMaterial, getOldMaterialReason } from '@/lib/product-utils';
import Image from 'next/image';

interface Product {
    id: string;
    name: string;
    brand: string;
    price: number;
    stock: number;
    images: string[];
    category?: string;
    isOldMaterial?: boolean;
    zeroStockDate?: string | null;
    oldMaterialDate?: string | null;
    updatedAt?: string | null;
    createdAt?: string | null;
    productInfo?: any;
    [key: string]: any;
}

interface CategoryData {
    id: string;
    name: string;
    parentId?: string | null;
    group?: string | null;
    deleted?: boolean;
    isCustom?: boolean;
}

const DEFAULT_CATEGORIES: CategoryData[] = [
    { id: 'all', name: 'All Categories', group: null },
    { id: 'laptops', name: 'Laptops', group: null },
    { id: 'probook', name: 'ProBook', group: null },
    { id: 'zbook-firefly', name: 'ZBook Firefly', group: null },
    { id: 'elitebook', name: 'EliteBook', group: null },
    { id: 'desktops', name: 'Desktops', group: null },
    { id: 'workstations', name: 'Workstations', group: null },
    { id: 'monitors', name: 'Monitors', group: null },
    { id: 'cctv', name: 'CCTV', group: null },
    { id: 'memory', name: 'Memory', group: 'Memory, Storage & Graphics' },
    { id: 'storage', name: 'Storage', group: 'Memory, Storage & Graphics' },
    { id: 'graphics-cards', name: 'Graphics Cards', group: 'Memory, Storage & Graphics' },
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

export default function OldMaterialPage() {
    const searchParams = useSearchParams();
    const categoryFromUrl = searchParams.get('category');

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl || 'all');
    const [searchQuery, setSearchQuery] = useState('');
    const [categories, setCategories] = useState<CategoryData[]>(DEFAULT_CATEGORIES);

    // Stock Inline Edit State
    const [editingStockId, setEditingStockId] = useState<string | null>(null);
    const [editingStockValue, setEditingStockValue] = useState<string>('');
    const [updatingStock, setUpdatingStock] = useState(false);
    const [restoringId, setRestoringId] = useState<string | null>(null);
    const [visibleCount, setVisibleCount] = useState(50);

    // Quick restore modal or state
    const [restoreModalProduct, setRestoreModalProduct] = useState<Product | null>(null);
    const [restoreStockInput, setRestoreStockInput] = useState<string>('1');

    // Reset visible count when filter or search changes
    useEffect(() => {
        setVisibleCount(50);
    }, [selectedCategory, searchQuery]);

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
                    name: cat.id === 'dvd-writers' ? 'DVD Writer' : (meta?.name || cat.name),
                    deleted: meta?.deleted || false
                };
            }).filter(cat => !cat.deleted || cat.id === 'all');

            setCategories(mergedCategories);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            setCategories(DEFAULT_CATEGORIES);
        }
    };

    const fetchProducts = async () => {
        if (categories.length === 1 && categories[0].id === 'all' && loading) {
            return;
        }

        setLoading(true);
        try {
            const allCategoryIds = categories
                .filter(c => c.id !== 'all' && c.id !== 'accessories' && c.id !== 'webcams' && c.id !== 'probook' && c.id !== 'zbook-firefly' && c.id !== 'elitebook')
                .map(c => c.id);
            const uniqueCategoryIds = Array.from(new Set(allCategoryIds));

            const allProducts: Product[] = [];

            await Promise.all(uniqueCategoryIds.map(async (category) => {
                try {
                    const querySnapshot = await getDocs(collection(db, category));
                    querySnapshot.docs.forEach(doc => {
                        const data = doc.data();
                        let productCat = data.category || category;

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
                    // Ignore errors for non-existent collections
                }
            }));

            setProducts(allProducts);
        } catch (error) {
            console.warn('Warning: Failed to fetch products:', error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const startEditStock = (productId: string, currentStock: number) => {
        setEditingStockId(productId);
        setEditingStockValue(currentStock.toString());
    };

    const handleCancelStock = () => {
        setEditingStockId(null);
        setEditingStockValue('');
    };

    const handleSaveStock = async (productId: string, productCategory: string, productName: string) => {
        const newStock = parseInt(editingStockValue, 10);
        if (isNaN(newStock) || newStock < 0) {
            toast.error('Please enter a valid stock quantity');
            return;
        }

        setUpdatingStock(true);
        try {
            const result = await updateProductStock(productId, productCategory, newStock);
            if (result.success) {
                if (newStock > 0) {
                    // If stock is now > 0, it moves out of old material back to active products!
                    setProducts(prev => prev.filter(p => p.id !== productId));
                    toast.success(`"${productName}" stock updated to ${newStock} and moved to active Products!`);
                } else {
                    setProducts(prev => prev.map(p => {
                        if (p.id === productId) {
                            return { ...p, stock: newStock };
                        }
                        return p;
                    }));
                    toast.success('Stock updated');
                }
                setEditingStockId(null);
            } else {
                throw new Error(result.error || 'Failed to update stock');
            }
        } catch (error: any) {
            console.error('Error updating stock:', error);
            toast.error(error.message || 'Failed to update stock');
        } finally {
            setUpdatingStock(false);
        }
    };

    const handleQuickRestore = async (productId: string, productCategory: string, productName: string, newStock: number) => {
        setRestoringId(productId);
        try {
            const result = await restoreFromOldMaterial(productId, productCategory, newStock);
            if (result.success) {
                // Product moved back to active section
                setProducts(prev => prev.filter(p => p.id !== productId));
                toast.success(`"${productName}" restored with stock ${newStock} and moved to active Products!`);
                setRestoreModalProduct(null);
            } else {
                throw new Error(result.error || 'Failed to restore product');
            }
        } catch (error: any) {
            console.error('Error restoring product:', error);
            toast.error(error.message || 'Failed to restore product');
        } finally {
            setRestoringId(null);
        }
    };

    const handleDelete = async (productId: string, productCategory: string) => {
        if (!confirm('Are you sure you want to permanently delete this product? This action cannot be undone.')) return;

        let categoryToDelete = productCategory || selectedCategory;

        if (categoryToDelete === 'probook' || categoryToDelete === 'zbook-firefly' || categoryToDelete === 'elitebook') {
            categoryToDelete = 'laptops';
        }

        if (categoryToDelete === 'all') {
            toast.error('Cannot delete product: unknown category');
            return;
        }

        const adminSession = sessionStorage.getItem('admin_user');
        if (!adminSession) {
            toast.error('Admin session expired. Please login again.');
            return;
        }

        try {
            const response = await fetch('/api/admin/products/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${btoa(adminSession)}`
                },
                body: JSON.stringify({ category: categoryToDelete, productId }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setProducts(prev => prev.filter(p => p.id !== productId));
                toast.success('Product deleted permanently');
            } else {
                throw new Error(result.error || 'Failed to delete product');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to delete product');
        }
    };

    // Filter only products that qualify as old material
    const oldMaterialProducts = useMemo(() => {
        return products.filter(p => isProductOldMaterial(p));
    }, [products]);

    const getOldProductCountForCategory = (catId: string) => {
        let count = 0;
        oldMaterialProducts.forEach(p => {
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

    const filteredOldProducts = useMemo(() => {
        return oldMaterialProducts.filter(product => {
            // Category Filter
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

            // Search Query Filter
            const query = searchQuery.toLowerCase();
            return (
                product.name.toLowerCase().includes(query) ||
                product.brand.toLowerCase().includes(query) ||
                (product.productInfo?.partNo || '').toLowerCase().includes(query)
            );
        });
    }, [oldMaterialProducts, selectedCategory, searchQuery]);

    const manuallyMovedCount = useMemo(() => {
        return oldMaterialProducts.filter(p => p.isOldMaterial).length;
    }, [oldMaterialProducts]);

    const zeroStockOverMonthCount = useMemo(() => {
        return oldMaterialProducts.filter(p => !p.isOldMaterial).length;
    }, [oldMaterialProducts]);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-xl">
                        <FiArchive className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                            Old Material & EOL Stock
                            <span className="text-xs px-2.5 py-1 font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                                {oldMaterialProducts.length} items
                            </span>
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Products with 0 stock for over 30 days or manually moved to End of Life.
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link
                        href="/admindashboard/products"
                        className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg transition-colors font-medium text-sm"
                    >
                        <FiArrowLeft className="mr-2" />
                        Back to Active Products
                    </Link>
                </div>
            </div>

            {/* Info / Notice Banner */}
            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl flex items-start gap-3">
                <FiAlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800 dark:text-amber-300">
                    <p className="font-semibold mb-0.5">Automated Stock & EOL Management</p>
                    <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                        • Items that remain at <strong>0 stock for more than 30 days (1 month)</strong> are automatically displayed here.<br />
                        • Click <strong>Change Stock</strong> or <strong>Restore</strong> to set new stock quantity. When stock is changed to a value &gt; 0, the item will <strong>automatically move back to the active Products section</strong>!
                    </p>
                </div>
            </div>

            {/* Quick Stat Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total Old Material</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{oldMaterialProducts.length}</p>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                        <FiArchive className="w-5 h-5" />
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">0 Stock (&gt; 30 Days)</p>
                        <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{zeroStockOverMonthCount}</p>
                    </div>
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg">
                        <FiRefreshCw className="w-5 h-5" />
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Manually Marked EOL</p>
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{manuallyMovedCount}</p>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg">
                        <FiAlertCircle className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search old material products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-amber-500 text-sm"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <FiFilter className="text-gray-400" />
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="p-2 pr-8 rounded-lg border dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-amber-500 text-sm"
                    >
                        <option value="all">All Categories ({getOldProductCountForCategory('all')} nos)</option>
                        {categories
                            .filter(cat => cat.id !== 'all' && cat.id !== 'accessories')
                            .map(cat => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name} ({getOldProductCountForCategory(cat.id)} nos)
                                </option>
                            ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[850px] text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-medium">
                            <tr>
                                <th className="p-4 w-20">Image</th>
                                <th className="p-4">Product Name</th>
                                <th className="p-4">Part Number</th>
                                {selectedCategory === 'all' && <th className="p-4">Category</th>}
                                <th className="p-4">Brand</th>
                                <th className="p-4">Price</th>
                                <th className="p-4">Old Status / Reason</th>
                                <th className="p-4">Change Stock</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={selectedCategory === 'all' ? 9 : 8} className="p-8 text-center text-gray-500">
                                        Loading old material products...
                                    </td>
                                </tr>
                            ) : filteredOldProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={selectedCategory === 'all' ? 9 : 8} className="p-12 text-center text-gray-500 dark:text-gray-400">
                                        <FiArchive className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                                        <p className="font-medium text-base text-gray-700 dark:text-gray-300">No old material products found</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {selectedCategory !== 'all' 
                                                ? `No items in ${selectedCategory} category.`
                                                : 'Products will appear here if stock is 0 for over a month or moved manually.'}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filteredOldProducts.slice(0, visibleCount).map((product) => {
                                    const reason = getOldMaterialReason(product);
                                    return (
                                        <tr key={product.id} className="hover:bg-amber-50/40 dark:hover:bg-amber-950/10 transition-colors">
                                            <td className="p-4">
                                                <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden flex items-center justify-center relative">
                                                    {product.images?.[0] ? (
                                                        <Image src={product.images[0]} alt={product.name} fill sizes="48px" className="object-cover opacity-80" />
                                                    ) : (
                                                        <span className="text-xs text-gray-400">No Img</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 font-medium dark:text-gray-200">
                                                <div className="line-clamp-2">{product.name}</div>
                                            </td>
                                            <td className="p-4 text-gray-500 dark:text-gray-400 font-mono text-xs">
                                                {product.productInfo?.partNo || '-'}
                                            </td>
                                            {selectedCategory === 'all' && (
                                                <td className="p-4">
                                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 capitalize">
                                                        {categories.find(c => c.id === product.category)?.name || product.category}
                                                    </span>
                                                </td>
                                            )}
                                            <td className="p-4 text-gray-500 dark:text-gray-400">{product.brand}</td>
                                            <td className="p-4 font-medium dark:text-gray-200">₹{product.price.toLocaleString('en-IN')}</td>
                                            
                                            {/* Status / Reason badge */}
                                            <td className="p-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium w-fit ${
                                                        product.isOldMaterial
                                                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                                                    }`}>
                                                        {reason.label}
                                                    </span>
                                                    {reason.date && (
                                                        <span className="text-[11px] text-gray-400">
                                                            Since: {reason.date}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Stock / Change Stock Button */}
                                            <td className="p-4">
                                                {editingStockId === product.id ? (
                                                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                                        <input
                                                            type="number"
                                                            value={editingStockValue}
                                                            onChange={(e) => setEditingStockValue(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    handleSaveStock(product.id, product.category || selectedCategory, product.name);
                                                                } else if (e.key === 'Escape') {
                                                                    handleCancelStock();
                                                                }
                                                            }}
                                                            disabled={updatingStock}
                                                            className="w-16 px-1.5 py-0.5 text-sm border rounded dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                            min="0"
                                                            placeholder="Qty"
                                                            autoFocus
                                                        />
                                                        <button
                                                            onClick={() => handleSaveStock(product.id, product.category || selectedCategory, product.name)}
                                                            disabled={updatingStock}
                                                            className="p-1 text-green-600 hover:bg-green-50 rounded dark:hover:bg-green-900/20 transition-colors disabled:opacity-50"
                                                            title="Save Stock (will move to Active if > 0)"
                                                        >
                                                            <FiCheck className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={handleCancelStock}
                                                            disabled={updatingStock}
                                                            className="p-1 text-red-600 hover:bg-red-50 rounded dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                                                            title="Cancel"
                                                        >
                                                            <FiX className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                                            {product.stock ?? 0} stock
                                                        </span>
                                                        <button
                                                            onClick={() => startEditStock(product.id, product.stock ?? 0)}
                                                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800/40 rounded-lg transition-colors cursor-pointer"
                                                            title="Change stock quantity"
                                                        >
                                                            <FiEdit2 className="w-3 h-3" />
                                                            <span>Change Stock</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => {
                                                            setRestoreModalProduct(product);
                                                            setRestoreStockInput('1');
                                                        }}
                                                        disabled={restoringId === product.id}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                                                        title="Restore this product back to Active Products"
                                                    >
                                                        <FiRefreshCw className={`w-3 h-3 ${restoringId === product.id ? 'animate-spin' : ''}`} />
                                                        <span>Restore</span>
                                                    </button>
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
                                                        title="Delete Product Permanently"
                                                    >
                                                        <FiTrash2 />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                {visibleCount < filteredOldProducts.length && (
                    <div className="flex justify-center p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
                        <button
                            onClick={() => setVisibleCount(prev => prev + 50)}
                            className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm cursor-pointer"
                        >
                            Load More
                        </button>
                    </div>
                )}
            </div>

            {/* Quick Restore Modal */}
            {restoreModalProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <FiPlusCircle className="text-emerald-500" />
                                Restore to Active Products
                            </h3>
                            <button
                                onClick={() => setRestoreModalProduct(null)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="mt-4 space-y-3">
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                You are restoring <strong>{restoreModalProduct.name}</strong> to the active products list.
                            </p>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                    Set New Stock Quantity
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={restoreStockInput}
                                    onChange={(e) => setRestoreStockInput(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                                    placeholder="Enter stock quantity (min 1)"
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setRestoreModalProduct(null)}
                                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    const qty = parseInt(restoreStockInput, 10);
                                    if (isNaN(qty) || qty <= 0) {
                                        toast.error('Please enter a valid stock quantity greater than 0');
                                        return;
                                    }
                                    handleQuickRestore(
                                        restoreModalProduct.id, 
                                        restoreModalProduct.category || selectedCategory, 
                                        restoreModalProduct.name, 
                                        qty
                                    );
                                }}
                                disabled={restoringId === restoreModalProduct.id}
                                className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                            >
                                {restoringId === restoreModalProduct.id ? 'Restoring...' : 'Confirm & Restore'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
