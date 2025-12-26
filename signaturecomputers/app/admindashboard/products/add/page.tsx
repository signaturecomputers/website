'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { createProduct } from '@/lib/admin-actions';
import { FiPlus, FiTrash2, FiSave, FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';
import { toast } from 'sonner';
import ProductInfoFormSection from '@/components/admin/ProductInfoFormSection';
import ImageUploadZone from '@/components/admin/ImageUploadZone';
import { ProductInfo } from '@/lib/products';

export default function AddProductPage() {
    const { adminUser } = useAdminAuth();
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        price: '',
        originalPrice: '',
        quantity: '1',
        category: 'laptops', // Default
        description: '',
    });

    const [specs, setSpecs] = useState([{ key: 'Processor', value: '' }, { key: 'RAM', value: '' }, { key: 'Storage', value: '' }]);
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [productInfo, setProductInfo] = useState<ProductInfo>({});

    const categories = [
        { id: 'laptops', name: 'Laptops', group: null },
        { id: 'desktops', name: 'Desktops', group: null },
        { id: 'monitors', name: 'Monitors', group: null },
        // Printers group
        { id: 'printers', name: 'All Printers', group: 'Printers' },
        { id: 'toners', name: 'Toners', group: 'Printers' },
        { id: 'cartridges', name: 'Cartridges', group: 'Printers' },
        // Accessories group
        { id: 'accessories', name: 'All Accessories', group: 'Accessories' },
        { id: 'keyboards', name: 'Keyboards', group: 'Accessories' },
        { id: 'headphones', name: 'Headphones', group: 'Accessories' },
        { id: 'cables', name: 'Cables', group: 'Accessories' },
        { id: 'power-adapters', name: 'Power Adapters', group: 'Accessories' },
        { id: 'mouse', name: 'Mouse', group: 'Accessories' },
        { id: 'keyboard-mouse-combo', name: 'Keyboard & Mouse Combo', group: 'Accessories' },
        { id: 'bags', name: 'Bags', group: 'Accessories' },
        { id: 'docks', name: 'Docks', group: 'Accessories' },
        { id: 'usb-flashdrives', name: 'USB Flash Drives', group: 'Accessories' },
        { id: 'dvd-writers', name: 'DVD Writers', group: 'Accessories' },
    ];

    // Handlers
    // Spec templates with specific order
    const SPEC_TEMPLATES: Record<string, string[]> = {
        laptops: ['Processor', 'Operating System', 'Display Size', 'Graphics', 'RAM', 'Storage'],
        desktops: ['Processor', 'Operating System', 'Display Size', 'Graphics', 'RAM', 'Storage'],
    };

    // Auto-populate specs based on category
    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCategory = e.target.value;
        setFormData(prev => ({ ...prev, category: newCategory }));

        // Check if current specs match a "clean" state (empty) or one of our templates
        const currentKeys = specs.map(s => s.key);
        const isGenericDefault = specs.length === 3 && specs[0].key === 'Processor';
        const isEmpty = specs.length === 0 || (specs.length === 1 && specs[0].key === '');

        // Check if current form matches Laptop or Desktop keys (ignoring values, or check emptiness if safer)
        const isLaptopTemplate = JSON.stringify(currentKeys) === JSON.stringify(SPEC_TEMPLATES['laptops']);
        const isDesktopTemplate = JSON.stringify(currentKeys) === JSON.stringify(SPEC_TEMPLATES['desktops']);

        // If we are in a "template" state (Generic, Empty, Laptop, or Desktop), allow switching to the new one
        if (SPEC_TEMPLATES[newCategory] && (isEmpty || isGenericDefault || isLaptopTemplate || isDesktopTemplate)) {
            // Preserve values if keys match, otherwise clear? 
            // For simplicity and to ensure "Video Connector" appears, we'll reset to the new template with empty values.
            // (User can fill them in. If they had data, it might be lost, but this is a setup step).
            setSpecs(SPEC_TEMPLATES[newCategory].map(key => ({ key, value: '' })));
        } else if (isGenericDefault && !SPEC_TEMPLATES[newCategory]) {
            // Reset to generic default if moving away from a template category to a generic one
            setSpecs([{ key: 'Processor', value: '' }, { key: 'RAM', value: '' }, { key: 'Storage', value: '' }]);
        }
    };

    // Apply default template on mount if applicable
    useEffect(() => {
        // If default category is laptops and specs are generic, load laptop template
        if (formData.category === 'laptops' && specs.length === 3 && specs[0].key === 'Processor' && specs[0].value === '') {
            if (SPEC_TEMPLATES['laptops']) {
                setSpecs(SPEC_TEMPLATES['laptops'].map(key => ({ key, value: '' })));
            }
        }
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'category') {
            // This branch is technically covered by the select onChange, logic split for clarity below
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setImages(prev => [...prev, ...newFiles]);

            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setImagePreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        // Revoke URL to prevent memory leak
        URL.revokeObjectURL(imagePreviews[index]);
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSpecChange = (index: number, field: 'key' | 'value', value: string) => {
        const newSpecs = [...specs];
        newSpecs[index][field] = value;
        setSpecs(newSpecs);
    };

    const addSpec = () => {
        setSpecs([...specs, { key: '', value: '' }]);
    };

    const removeSpec = (index: number) => {
        setSpecs(specs.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            // 1. Upload Images
            const imageUrls = await Promise.all(
                images.map(async (file) => {
                    const formData = new FormData();
                    formData.append('file', file);

                    const response = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData,
                    });

                    if (!response.ok) {
                        throw new Error('Upload failed');
                    }

                    const data = await response.json();
                    return data.url;
                })
            );

            // 2. Prepare Data (Server Action expects plain object)
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
                images: imageUrls,
                category: formData.category,
                createdAt: new Date().toISOString(), // Use ISO string for Server Action serialization
                createdBy: adminUser?.username || 'admin',
                productInfo: productInfo, // Include extended product info
            };

            // 3. Save via Server Action
            const result = await createProduct(formData.category, productData);

            if (result.success) {
                toast.success('Product added successfully!');
                router.push('/admindashboard/products');
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Error adding product:', error);
            toast.error('Failed to add product.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admindashboard/products" className="p-2 hover:bg-gray-100 rounded-full dark:hover:bg-gray-800 transition-colors">
                    <FiArrowLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-2xl font-bold dark:text-white">Add New Product</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Info */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-6">
                    <h2 className="text-lg font-semibold dark:text-white mb-4">Basic Information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-2 dark:text-gray-300">Product Name</label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full p-2.5 rounded-lg border dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g. MacBook Pro M3"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 dark:text-gray-300">Brand</label>
                            <input
                                type="text"
                                name="brand"
                                required
                                value={formData.brand}
                                onChange={handleInputChange}
                                className="w-full p-2.5 rounded-lg border dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g. Apple"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-2 dark:text-gray-300">Price (₹)</label>
                            <input
                                type="number"
                                name="price"
                                required
                                min="0"
                                value={formData.price}
                                onChange={handleInputChange}
                                className="w-full p-2.5 rounded-lg border dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 dark:text-gray-300">Original Price (₹)</label>
                            <input
                                type="number"
                                name="originalPrice"
                                min="0"
                                value={formData.originalPrice}
                                onChange={handleInputChange}
                                className="w-full p-2.5 rounded-lg border dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 dark:text-gray-300">Stock Quantity</label>
                            <input
                                type="number"
                                name="quantity"
                                required
                                min="0"
                                value={formData.quantity}
                                onChange={handleInputChange}
                                className="w-full p-2.5 rounded-lg border dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 dark:text-gray-300">Category</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleCategoryChange}
                            className="w-full p-2.5 rounded-lg border dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                        >
                            {/* Ungrouped items */}
                            {categories.filter(c => !c.group).map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}

                            {/* Printers group */}
                            <optgroup label="Printers">
                                {categories.filter(c => c.group === 'Printers').map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </optgroup>

                            {/* Accessories group */}
                            <optgroup label="Accessories">
                                {categories.filter(c => c.group === 'Accessories').map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </optgroup>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 dark:text-gray-300">Description</label>
                        <textarea
                            name="description"
                            rows={4}
                            required
                            value={formData.description}
                            onChange={handleInputChange}
                            className="w-full p-2.5 rounded-lg border dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                            placeholder="Product description and key highlights..."
                        />
                    </div>
                </div>

                {/* Images */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold dark:text-white mb-4">Product Images</h2>
                    <ImageUploadZone
                        images={images}
                        setImages={setImages}
                        imagePreviews={imagePreviews}
                        setImagePreviews={setImagePreviews}
                        maxImages={10}
                    />
                </div>

                {/* Specs */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold dark:text-white">Specifications</h2>
                        <button
                            type="button"
                            onClick={addSpec}
                            className="flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                            <FiPlus className="mr-1" /> Add Spec
                        </button>
                    </div>
                    <div className="space-y-3">
                        {specs.map((spec, idx) => (
                            <div key={idx} className="flex gap-4">
                                <input
                                    type="text"
                                    placeholder="Key (e.g. Processor)"
                                    value={spec.key}
                                    onChange={(e) => handleSpecChange(idx, 'key', e.target.value)}
                                    className="flex-1 p-2.5 rounded-lg border dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                />
                                <input
                                    type="text"
                                    placeholder="Value (e.g. Apple M3 Max)"
                                    value={spec.value}
                                    onChange={(e) => handleSpecChange(idx, 'value', e.target.value)}
                                    className="flex-1 p-2.5 rounded-lg border dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeSpec(idx)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <FiTrash2 />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Extended Product Information */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <ProductInfoFormSection productInfo={productInfo} setProductInfo={setProductInfo} />
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-4">
                    <Link
                        href="/admindashboard/products"
                        className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="flex items-center px-8 py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? 'Saving...' : (
                            <>
                                <FiSave className="mr-2" /> Save Product
                            </>
                        )}
                    </button>
                </div>
            </form >
        </div >
    );
}
