'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getAllProducts, Product } from '@/lib/products';
import { FiSearch, FiPlus, FiTrash2, FiStar, FiEdit2, FiSave, FiX } from 'react-icons/fi';
import { toast } from 'sonner';

interface HotDeal {
    id: string;
    productId: string;
    product?: Product;
    order: number;
    addedAt: any;
}

interface EditingPrice {
    dealId: string;
    price: number;
    originalPrice: number;
}

export default function HotDealsPage() {
    const [hotDeals, setHotDeals] = useState<HotDeal[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingPrice, setEditingPrice] = useState<EditingPrice | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch all products
            const products = await getAllProducts();
            setAllProducts(products);

            // Fetch hot deals
            const hotDealsRef = collection(db, 'hot_deals');
            const snapshot = await getDocs(hotDealsRef);
            const deals = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as HotDeal[];

            // Attach product details to each hot deal
            const dealsWithProducts = deals.map(deal => ({
                ...deal,
                product: products.find(p => p.id === deal.productId)
            })).sort((a, b) => (a.order || 0) - (b.order || 0));

            setHotDeals(dealsWithProducts);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error('Failed to load hot deals');
        } finally {
            setLoading(false);
        }
    };

    const addToHotDeals = async (product: Product) => {
        try {
            const dealRef = doc(db, 'hot_deals', product.id);

            // Check if already exists
            const existing = await getDoc(dealRef);
            if (existing.exists()) {
                toast.error('Product is already a hot deal');
                return;
            }

            await setDoc(dealRef, {
                productId: product.id,
                order: hotDeals.length + 1,
                addedAt: new Date()
            });

            toast.success('Added to hot deals!');
            setShowAddModal(false);
            fetchData();
        } catch (error) {
            console.error('Failed to add hot deal:', error);
            toast.error('Failed to add hot deal');
        }
    };

    const removeFromHotDeals = async (dealId: string) => {
        if (!confirm('Remove this product from hot deals?')) return;

        try {
            await deleteDoc(doc(db, 'hot_deals', dealId));
            toast.success('Removed from hot deals');
            fetchData();
        } catch (error) {
            console.error('Failed to remove hot deal:', error);
            toast.error('Failed to remove hot deal');
        }
    };

    const startEditing = (deal: HotDeal) => {
        setEditingPrice({
            dealId: deal.id,
            price: deal.product?.price || 0,
            originalPrice: deal.product?.originalPrice || 0
        });
    };

    const cancelEditing = () => {
        setEditingPrice(null);
    };

    const savePrice = async (deal: HotDeal) => {
        if (!editingPrice || !deal.product?.category) return;

        setSaving(true);
        try {
            // Update the product in its category collection
            const productRef = doc(db, deal.product.category, deal.productId);
            await updateDoc(productRef, {
                price: editingPrice.price,
                originalPrice: editingPrice.originalPrice
            });

            toast.success('Price updated successfully!');
            setEditingPrice(null);
            fetchData();
        } catch (error) {
            console.error('Failed to update price:', error);
            toast.error('Failed to update price');
        } finally {
            setSaving(false);
        }
    };

    // Filter products not already in hot deals for the add modal
    const availableProducts = allProducts.filter(
        p => !hotDeals.some(hd => hd.productId === p.id) &&
            (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.productInfo?.partNo?.toLowerCase() || '').includes(searchQuery.toLowerCase()))
    );

    const calculateDiscount = (price: number, originalPrice: number) => {
        if (!originalPrice || originalPrice <= price) return 0;
        return Math.round(((originalPrice - price) / originalPrice) * 100);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                        <FiStar className="text-yellow-500" />
                        Hot Deals
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Manage products displayed in the Hot Deals section
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                    <FiPlus /> Add Hot Deal
                </button>
            </div>

            {/* Current Hot Deals */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b dark:border-gray-700">
                    <h2 className="font-semibold dark:text-white">Current Hot Deals ({hotDeals.length})</h2>
                    <p className="text-xs text-gray-500 mt-1">Click the edit button to change price and discount</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-medium">
                            <tr>
                                <th className="p-4">#</th>
                                <th className="p-4">Product</th>
                                <th className="p-4">Part Number</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Sale Price (₹)</th>
                                <th className="p-4">Original Price (₹)</th>
                                <th className="p-4">Discount</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center text-gray-500">Loading...</td>
                                </tr>
                            ) : hotDeals.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-gray-500">
                                        No hot deals set. Click "Add Hot Deal" to get started.
                                    </td>
                                </tr>
                            ) : (
                                hotDeals.map((deal, index) => {
                                    const isEditing = editingPrice?.dealId === deal.id;
                                    const currentPrice = isEditing ? editingPrice.price : (deal.product?.price || 0);
                                    const currentOriginal = isEditing ? editingPrice.originalPrice : (deal.product?.originalPrice || 0);
                                    const discount = calculateDiscount(currentPrice, currentOriginal);

                                    return (
                                        <tr key={deal.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <td className="p-4 text-gray-500">{index + 1}</td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    {deal.product?.images?.[0] ? (
                                                        <img
                                                            src={deal.product.images[0]}
                                                            alt=""
                                                            className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                                            <FiStar className="text-gray-400" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-medium dark:text-gray-200">
                                                            {deal.product?.name || 'Unknown Product'}
                                                        </p>
                                                        <p className="text-xs text-gray-500">{deal.product?.brand}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm text-gray-500 dark:text-gray-400">
                                                {deal.product?.productInfo?.partNo || '-'}
                                            </td>
                                            <td className="p-4">
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 capitalize">
                                                    {deal.product?.category || '-'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                {isEditing ? (
                                                    <input
                                                        type="number"
                                                        value={editingPrice.price}
                                                        onChange={(e) => setEditingPrice({
                                                            ...editingPrice,
                                                            price: Number(e.target.value)
                                                        })}
                                                        className="w-28 p-2 rounded border dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                                    />
                                                ) : (
                                                    <span className="font-medium dark:text-gray-200">
                                                        ₹{currentPrice.toLocaleString()}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                {isEditing ? (
                                                    <input
                                                        type="number"
                                                        value={editingPrice.originalPrice}
                                                        onChange={(e) => setEditingPrice({
                                                            ...editingPrice,
                                                            originalPrice: Number(e.target.value)
                                                        })}
                                                        className="w-28 p-2 rounded border dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                                    />
                                                ) : (
                                                    <span className="text-gray-500 dark:text-gray-400">
                                                        {currentOriginal > 0 ? `₹${currentOriginal.toLocaleString()}` : '-'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                {discount > 0 ? (
                                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                        {discount}% OFF
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {isEditing ? (
                                                        <>
                                                            <button
                                                                onClick={() => savePrice(deal)}
                                                                disabled={saving}
                                                                className="p-2 text-green-500 hover:bg-green-50 rounded-lg dark:hover:bg-green-900/20 transition-colors disabled:opacity-50"
                                                                title="Save"
                                                            >
                                                                <FiSave />
                                                            </button>
                                                            <button
                                                                onClick={cancelEditing}
                                                                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 transition-colors"
                                                                title="Cancel"
                                                            >
                                                                <FiX />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => startEditing(deal)}
                                                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg dark:hover:bg-blue-900/20 transition-colors"
                                                                title="Edit Price"
                                                            >
                                                                <FiEdit2 />
                                                            </button>
                                                            <button
                                                                onClick={() => removeFromHotDeals(deal.id)}
                                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg dark:hover:bg-red-900/20 transition-colors"
                                                                title="Remove from Hot Deals"
                                                            >
                                                                <FiTrash2 />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Hot Deal Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowAddModal(false)}
                    />
                    <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden flex flex-col">
                        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                            <h2 className="text-lg font-bold dark:text-white">Add Product to Hot Deals</h2>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-4 border-b dark:border-gray-700">
                            <div className="relative">
                                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                />
                            </div>
                        </div>
                        <div className="overflow-y-auto flex-1 p-4">
                            {availableProducts.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">No products available</p>
                            ) : (
                                <div className="space-y-2">
                                    {availableProducts.map(product => (
                                        <div
                                            key={product.id}
                                            className="flex items-center justify-between p-3 rounded-lg border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            <div className="flex items-center gap-3">
                                                {product.images?.[0] ? (
                                                    <img
                                                        src={product.images[0]}
                                                        alt=""
                                                        className="w-10 h-10 rounded object-cover bg-gray-100"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded bg-gray-200" />
                                                )}
                                                <div>
                                                    <p className="font-medium dark:text-gray-200 text-sm">{product.name}</p>
                                                    <p className="text-xs text-gray-500">
                                                        ₹{product.price.toLocaleString()}
                                                        {product.originalPrice && product.originalPrice > product.price && (
                                                            <span className="ml-2 text-green-600">
                                                                ({Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off)
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => addToHotDeals(product)}
                                                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-1"
                                            >
                                                <FiPlus /> Add
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
