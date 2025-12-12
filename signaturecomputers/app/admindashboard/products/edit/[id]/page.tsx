'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiUpload, FiX, FiPlus, FiTrash2, FiSave, FiArrowLeft } from 'react-icons/fi';
import { toast } from 'sonner';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getProductById } from '@/lib/products';
import { updateProduct } from '@/lib/admin-actions';
import Link from 'next/link';

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const productId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        price: '',
        originalPrice: '',
        quantity: '',
        category: '',
        description: '',
    });

    const [specs, setSpecs] = useState<{ key: string; value: string }[]>([
        { key: 'Processor', value: '' },
        { key: 'RAM', value: '' },
        { key: 'Storage', value: '' },
    ]);

    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [newImages, setNewImages] = useState<File[]>([]);
    const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

    // Fetch Product Data
    useEffect(() => {
        async function loadProduct() {
            setLoading(true);
            const product = await getProductById(productId);

            if (product) {
                setFormData({
                    name: product.name,
                    brand: product.brand,
                    price: product.price.toString(),
                    originalPrice: product.originalPrice ? product.originalPrice.toString() : '',
                    quantity: product.stock.toString(),
                    category: product.category,
                    description: product.description,
                });

                // Map specs object back to array
                if (product.specs) {
                    const specsArray = Object.entries(product.specs).map(([key, value]) => ({ key, value }));
                    setSpecs(specsArray.length > 0 ? specsArray : [{ key: '', value: '' }]);
                }

                setExistingImages(product.images || []);
            } else {
                toast.error('Product not found');
                router.push('/admindashboard/products');
            }
            setLoading(false);
        }

        if (productId) {
            loadProduct();
        }
    }, [productId, router]);

    // Handle Image Selection
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setNewImages(prev => [...prev, ...files]);

            // Create previews
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setNewImagePreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeNewImage = (index: number) => {
        setNewImages(prev => prev.filter((_, i) => i !== index));
        setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (index: number) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    // Spec Handlers
    const addSpec = () => {
        setSpecs([...specs, { key: '', value: '' }]);
    };

    const removeSpec = (index: number) => {
        setSpecs(specs.filter((_, i) => i !== index));
    };

    const updateSpec = (index: number, field: 'key' | 'value', value: string) => {
        const newSpecs = [...specs];
        newSpecs[index][field] = value;
        setSpecs(newSpecs);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            // 1. Upload New Images (if any)
            let uploadedImageUrls: string[] = [];
            if (newImages.length > 0) {
                uploadedImageUrls = await Promise.all(
                    newImages.map(async (file) => {
                        const formData = new FormData();
                        formData.append('file', file);

                        const response = await fetch('/api/upload', {
                            method: 'POST',
                            body: formData,
                        });

                        if (!response.ok) throw new Error('Upload failed');
                        const data = await response.json();
                        return data.url;
                    })
                );
            }

            // Combine existing and new images
            const finalImages = [...existingImages, ...uploadedImageUrls];

            // 2. Prepare Data
            const productData = {
                name: formData.name,
                brand: formData.brand,
                price: parseFloat(formData.price),
                originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
                stock: parseInt(formData.quantity),
                description: formData.description,
                specs: specs.reduce((acc, spec) => {
                    if (spec.key && spec.value) acc[spec.key] = spec.value;
                    return acc;
                }, {} as Record<string, string>),
                images: finalImages,
                updatedAt: new Date().toISOString(),
            };

            // 3. Update via Server Action
            const result = await updateProduct(formData.category, productId, productData);

            if (result.success) {
                toast.success('Product updated successfully!');
                router.push('/admindashboard/products');
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Error updating product:', error);
            toast.error('Failed to update product.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading product data...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admindashboard/products" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <FiArrowLeft className="text-xl text-gray-600" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Product</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Product Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="e.g. MacBook Pro 16"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Brand</label>
                        <input
                            type="text"
                            required
                            value={formData.brand}
                            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="e.g. Apple"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                        <input
                            type="text"
                            disabled
                            value={formData.category}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed"
                            title="Category cannot be changed after creation"
                        />
                        <p className="text-xs text-gray-400">Category cannot be changed.</p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Stock Quantity</label>
                        <input
                            type="number"
                            required
                            min="0"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Price ($)</label>
                        <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Original Price (Optional)</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.originalPrice}
                            onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                    <textarea
                        required
                        rows={4}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                    />
                </div>

                {/* Specs */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Specifications</label>
                        <button type="button" onClick={addSpec} className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                            <FiPlus /> Add Spec
                        </button>
                    </div>
                    <div className="space-y-3">
                        {specs.map((spec, index) => (
                            <div key={index} className="flex gap-4">
                                <input
                                    type="text"
                                    placeholder="Key (e.g. Processor)"
                                    value={spec.key}
                                    onChange={(e) => updateSpec(index, 'key', e.target.value)}
                                    className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <input
                                    type="text"
                                    placeholder="Value (e.g. M3 Pro)"
                                    value={spec.value}
                                    onChange={(e) => updateSpec(index, 'value', e.target.value)}
                                    className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeSpec(index)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <FiTrash2 />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Images */}
                <div className="space-y-4">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Product Images</label>

                    {/* Existing Images */}
                    {existingImages.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            {existingImages.map((src, index) => (
                                <div key={`existing-${index}`} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200">
                                    <img src={src} alt="Existing" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeExistingImage(index)}
                                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <FiX className="w-4 h-4" />
                                    </button>
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">Existing</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* New Image Previews */}
                    {newImagePreviews.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            {newImagePreviews.map((src, index) => (
                                <div key={`new-${index}`} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200">
                                    <img src={src} alt="Preview" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeNewImage(index)}
                                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <FiX className="w-4 h-4" />
                                    </button>
                                    <div className="absolute bottom-0 left-0 right-0 bg-green-600/50 text-white text-xs p-1 text-center">New</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Upload Box */}
                    <div className="relative">
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 flex flex-col items-center justify-center text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors bg-gray-50 dark:bg-gray-800/50">
                            <FiUpload className="w-8 h-8 mb-3" />
                            <p className="font-medium">Click to upload more images</p>
                            <p className="text-sm mt-1">PNG, JPG up to 10MB</p>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {submitting ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <>
                            <FiSave className="w-5 h-5" /> Save Changes
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
