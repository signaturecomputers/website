'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getProductById, Product } from '@/lib/products';
import Link from 'next/link';
import { FiArrowLeft, FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiCheck } from 'react-icons/fi';
import { toast } from 'sonner';
import { createCarePack, updateCarePack, deleteCarePack } from '@/lib/admin-actions';

interface CarePack {
    id: string;
    productPartNo: string;
    title: string;
    duration: string;
    price: number;
    partNumber: string;
    supportedSeries: string;
    enabled: boolean;
}

export default function AssignCarePacksPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const [product, setProduct] = useState<Product | null>(null);
    const [carePacks, setCarePacks] = useState<CarePack[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // Form modal state
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingPack, setEditingPack] = useState<CarePack | null>(null);

    // Form inputs state
    const [formInputs, setFormInputs] = useState({
        title: '',
        duration: '',
        price: '',
        partNumber: '',
        supportedSeries: '',
        enabled: true
    });

    useEffect(() => {
        if (id) {
            loadProductAndCarePacks();
        }
    }, [id]);

    async function loadProductAndCarePacks() {
        setLoading(true);
        try {
            const productData = await getProductById(id);
            if (productData) {
                setProduct(productData);
                const partNo = productData.productInfo?.partNo || '';
                
                if (partNo) {
                    const carePacksRef = collection(db, 'care_packs');
                    const q = query(carePacksRef, where('productPartNo', '==', partNo));
                    const snapshot = await getDocs(q);
                    const packs = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    })) as CarePack[];
                    setCarePacks(packs);
                } else {
                    toast.error("This product does not have a Part Number set.");
                }
            } else {
                toast.error("Product not found");
                router.push('/admindashboard/products/care-packs');
            }
        } catch (err) {
            console.error("Error loading product and care packs:", err);
            toast.error("Error loading details");
        } finally {
            setLoading(false);
        }
    }

    const openAddModal = () => {
        setEditingPack(null);
        setFormInputs({
            title: 'HP Extended Warranty',
            duration: '1 Year → 3 Years',
            price: '',
            partNumber: '',
            supportedSeries: product?.productInfo?.series || '',
            enabled: true
        });
        setShowFormModal(true);
    };

    const openEditModal = (pack: CarePack) => {
        setEditingPack(pack);
        setFormInputs({
            title: pack.title,
            duration: pack.duration,
            price: pack.price.toString(),
            partNumber: pack.partNumber,
            supportedSeries: pack.supportedSeries || '',
            enabled: pack.enabled
        });
        setShowFormModal(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const partNo = product?.productInfo?.partNo;
        if (!partNo) {
            toast.error("Product Part Number is required to assign Care Packs");
            return;
        }

        const priceNum = parseFloat(formInputs.price.replace(/[^\d.]/g, ''));
        if (isNaN(priceNum) || priceNum <= 0) {
            toast.error("Please enter a valid price");
            return;
        }

        if (!formInputs.title || !formInputs.duration || !formInputs.partNumber) {
            toast.error("Please fill all required fields");
            return;
        }

        setActionLoading(true);
        try {
            const dataToSave = {
                productPartNo: partNo,
                title: formInputs.title,
                duration: formInputs.duration,
                price: priceNum,
                partNumber: formInputs.partNumber,
                supportedSeries: formInputs.supportedSeries,
                enabled: formInputs.enabled
            };

            if (editingPack) {
                // Update
                const result = await updateCarePack(editingPack.id, dataToSave);
                if (result.success) {
                    toast.success("Care Pack updated successfully");
                } else {
                    throw new Error(result.error);
                }
            } else {
                // Create
                const result = await createCarePack(dataToSave);
                if (result.success) {
                    toast.success("Care Pack added successfully");
                } else {
                    throw new Error(result.error);
                }
            }

            setShowFormModal(false);
            loadProductAndCarePacks();
        } catch (err) {
            console.error("Error saving Care Pack:", err);
            toast.error("Failed to save Care Pack");
        } finally {
            setActionLoading(false);
        }
    };

    const handleToggleEnable = async (pack: CarePack) => {
        try {
            const result = await updateCarePack(pack.id, { enabled: !pack.enabled });
            if (result.success) {
                toast.success(`Care Pack ${!pack.enabled ? 'enabled' : 'disabled'} successfully`);
                loadProductAndCarePacks();
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            console.error("Error toggling status:", err);
            toast.error("Failed to update status");
        }
    };

    const handleDelete = async (packId: string) => {
        if (!confirm("Are you sure you want to delete this Care Pack Assignment?")) return;

        try {
            const result = await deleteCarePack(packId);
            if (result.success) {
                toast.success("Care Pack deleted successfully");
                loadProductAndCarePacks();
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            console.error("Error deleting Care Pack:", err);
            toast.error("Failed to delete Care Pack");
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading assignments...</div>;
    }

    if (!product) {
        return <div className="p-8 text-center text-red-500">Product not found.</div>;
    }

    const partNo = product.productInfo?.partNo || '';
    const series = product.productInfo?.series || '';
    const warranty = product.productInfo?.warranty?.duration || '1 Year';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admindashboard/products/care-packs"
                        className="p-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        <FiArrowLeft className="text-gray-600 dark:text-gray-300" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold dark:text-white">Manage Care Packs</h1>
                        <p className="text-sm text-gray-500">Assign HP Care Packs to {product.name}</p>
                    </div>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                >
                    <FiPlus /> Add Care Pack
                </button>
            </div>

            {/* Product Card Details */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-6">
                <div className="w-32 h-32 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {product.images?.[0] ? (
                        <img src={product.images[0]} alt="" className="w-full h-full object-contain p-2" />
                    ) : (
                        <span className="text-gray-400">No Image</span>
                    )}
                </div>
                <div className="flex-1 space-y-3">
                    <h2 className="text-xl font-bold dark:text-white">{product.name}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                            <span className="text-xs text-gray-400 block mb-0.5">Product Part Number</span>
                            <span className="font-mono font-semibold text-gray-800 dark:text-gray-200">{partNo || 'Not Set'}</span>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                            <span className="text-xs text-gray-400 block mb-0.5">Base Warranty</span>
                            <span className="font-semibold text-gray-800 dark:text-gray-200">{warranty}</span>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                            <span className="text-xs text-gray-400 block mb-0.5">Supported Series</span>
                            <span className="font-semibold text-gray-800 dark:text-gray-200">{series || 'Not Set'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Assigned Care Packs list */}
            <div>
                <h3 className="text-lg font-bold dark:text-white mb-4">Assigned Care Packs ({carePacks.length})</h3>
                {carePacks.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700 text-center text-gray-500 shadow-sm">
                        No Care Packs assigned to this product yet. Click "+ Add Care Pack" to start.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {carePacks.map((pack) => (
                            <div
                                key={pack.id}
                                className={`bg-white dark:bg-gray-800 p-5 rounded-xl border-2 shadow-sm transition-all flex flex-col justify-between ${
                                    pack.enabled
                                        ? 'border-gray-100 dark:border-gray-700'
                                        : 'border-dashed border-gray-300 dark:border-gray-600 opacity-60'
                                }`}
                            >
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <span className="text-xs font-semibold px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 rounded-full">
                                                {pack.duration}
                                            </span>
                                            <h4 className="font-bold text-gray-900 dark:text-white mt-1.5">{pack.title}</h4>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                onClick={() => handleToggleEnable(pack)}
                                                className={`px-2 py-1 rounded text-xs font-medium border transition-colors ${
                                                    pack.enabled
                                                        ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                                        : 'bg-gray-100 text-gray-500 border-gray-300 hover:bg-gray-200'
                                                }`}
                                            >
                                                {pack.enabled ? 'Enabled' : 'Disabled'}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Care Pack Part No:</span>
                                            <span className="font-mono font-semibold dark:text-gray-300">{pack.partNumber}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Price:</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">₹{pack.price.toLocaleString('en-IN')} + 18% GST</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Series Compatibility:</span>
                                            <span className="font-medium text-gray-700 dark:text-gray-300 text-right max-w-[150px] truncate" title={pack.supportedSeries}>
                                                {pack.supportedSeries || 'All'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 border-t border-gray-100 dark:border-gray-700 pt-3 mt-4">
                                    <button
                                        onClick={() => openEditModal(pack)}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 border dark:border-gray-600 rounded text-xs font-medium text-gray-700 dark:text-gray-200 transition-colors"
                                    >
                                        <FiEdit2 size={12} /> Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(pack.id)}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-900 rounded text-xs font-medium text-red-600 dark:text-red-400 transition-colors"
                                    >
                                        <FiTrash2 size={12} /> Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add / Edit Form Modal */}
            {showFormModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6 relative border dark:border-gray-700">
                        <button
                            onClick={() => setShowFormModal(false)}
                            className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500"
                        >
                            <FiX size={20} />
                        </button>
                        
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                            {editingPack ? 'Edit Care Pack Assignment' : 'Add Care Pack Assignment'}
                        </h3>

                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-gray-500 block mb-1">Care Pack Title (Header) *</label>
                                <input
                                    type="text"
                                    required
                                    value={formInputs.title}
                                    onChange={(e) => setFormInputs({...formInputs, title: e.target.value})}
                                    placeholder="e.g. HP Extended Warranty"
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-medium text-gray-500 block mb-1">Warranty Duration *</label>
                                <input
                                    type="text"
                                    required
                                    value={formInputs.duration}
                                    onChange={(e) => setFormInputs({...formInputs, duration: e.target.value})}
                                    placeholder="e.g. 1 Year → 3 Years"
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-500 block mb-1">Care Pack Part Number *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formInputs.partNumber}
                                        onChange={(e) => setFormInputs({...formInputs, partNumber: e.target.value.toUpperCase()})}
                                        placeholder="e.g. UK703E"
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 block mb-1">Price (₹, Excl. GST) *</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={formInputs.price}
                                        onChange={(e) => setFormInputs({...formInputs, price: e.target.value})}
                                        placeholder="5100"
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-gray-500 block mb-1">Supported Series</label>
                                <input
                                    type="text"
                                    value={formInputs.supportedSeries}
                                    onChange={(e) => setFormInputs({...formInputs, supportedSeries: e.target.value})}
                                    placeholder="e.g. EliteBook 840 G10"
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="enabled-toggle"
                                    checked={formInputs.enabled}
                                    onChange={(e) => setFormInputs({...formInputs, enabled: e.target.checked})}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                                />
                                <label htmlFor="enabled-toggle" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Enable this Care Pack for checkout/details pages
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4 border-t dark:border-gray-700 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowFormModal(false)}
                                    className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                                >
                                    <FiSave /> {actionLoading ? 'Saving...' : 'Save Pack'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
