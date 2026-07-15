'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { FiSave, FiArrowLeft, FiTrash2, FiPlus, FiAlertCircle } from 'react-icons/fi';
import Link from 'next/link';
import { toast } from 'sonner';
import ProductInfoFormSection from '@/components/admin/ProductInfoFormSection';
import ImageUploadZone from '@/components/admin/ImageUploadZone';
import { ProductInfo } from '@/lib/products';
import { updateProduct } from '@/lib/admin-actions';

interface CategoryData {
    id: string;
    name: string; // Display name
    parentId?: string | null;
    group?: string | null; // For UI grouping
    deleted?: boolean;
    isCustom?: boolean;
}

const DEFAULT_CATEGORIES = [
    { id: 'laptops', name: 'Laptops', group: null },
    { id: 'probook', name: 'ProBook', group: null },
    { id: 'zbook-firefly', name: 'ZBook Firefly', group: null },
    { id: 'desktops', name: 'Desktops', group: null },
    { id: 'workstations', name: 'Workstations', group: null },
    { id: 'monitors', name: 'Monitors', group: null },
    { id: 'cctv', name: 'CCTV', group: null },
    // Memory, Storage & Graphics group
    { id: 'memory', name: 'Memory', group: 'Memory, Storage & Graphics' },
    { id: 'storage', name: 'Storage', group: 'Memory, Storage & Graphics' },
    { id: 'graphics-cards', name: 'Graphics Cards', group: 'Memory, Storage & Graphics' },
    // Accessories group
    { id: 'accessories', name: 'Accessories', group: 'Accessories' },
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

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { adminUser } = useAdminAuth();
    const router = useRouter();

    // Unwrap params
    const { id: productId } = use(params);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [notFound, setNotFound] = useState(false);
    const [originalCategory, setOriginalCategory] = useState(''); // Track original category for moving products

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        price: '',
        originalPrice: '',
        quantity: '1',
        category: '',
        description: '',
    });

    const [specs, setSpecs] = useState<{ key: string; value: string }[]>([]);
    const [images, setImages] = useState<File[]>([]); // New images to upload
    const [existingImages, setExistingImages] = useState<string[]>([]); // URLs of existing images
    const [imagePreviews, setImagePreviews] = useState<string[]>([]); // Previews for NEW images
    const [productInfo, setProductInfo] = useState<ProductInfo>({});

    // Category State
    const [allCategories, setAllCategories] = useState<CategoryData[]>(DEFAULT_CATEGORIES);
    const [loadingCategories, setLoadingCategories] = useState(true);

    useEffect(() => {
        fetchData();
    }, [productId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Categories (Parallel)
            const categoriesPromise = fetchCategories();

            // 2. We don't know the collection, so we search for the product ID
            await categoriesPromise;

            // Wait for state update is not ideal in same render cycle, so we use the promise result directly if possible
            // But fetchCategories updates state. Let's call the logic directly here to use the data.
            const fetchedCategories = await getCategoriesData();
            setAllCategories(fetchedCategories);

            let productData = null;
            let productCategory = '';

            // Check all potential collections (Default + Custom, excluding virtual categories)
            const collectionNames = fetchedCategories
                .map(c => c.id)
                .filter(id => id !== 'probook' && id !== 'zbook-firefly');

            for (const colName of collectionNames) {
                const docRef = doc(db, colName, productId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    productData = docSnap.data();
                    productCategory = colName;
                    break;
                }
            }

            if (!productData) {
                setNotFound(true);
                return;
            }

            // Populate Form
            let formCategory = productCategory === 'dvd-writers' 
                ? (productData.productInfo?.othersType === 'webcam' 
                    ? 'webcams' 
                    : (productData.productInfo?.othersType === 'other' ? 'others' : 'dvd-writers'))
                : productCategory;

            if (formCategory === 'laptops') {
                const nameLower = (productData.name || '').toLowerCase();
                if (nameLower.includes('hp probook')) {
                    formCategory = 'probook';
                } else if (nameLower.includes('zbook firefly')) {
                    formCategory = 'zbook-firefly';
                }
            }

            setFormData({
                name: productData.name || '',
                brand: productData.brand || '',
                price: productData.price?.toString() || '',
                originalPrice: productData.originalPrice?.toString() || '',
                quantity: productData.stock?.toString() || '0',
                category: formCategory,
                description: productData.description || '',
            });

            // Store original category for later comparison
            setOriginalCategory(productCategory);

            // Specs
            if (productData.specs) {
                const specArray = Object.entries(productData.specs).map(([key, value]) => ({
                    key,
                    value: value as string,
                }));
                setSpecs(specArray);
            }

            // Images
            if (productData.images && Array.isArray(productData.images)) {
                setExistingImages(productData.images);
            }

            // Product Info
            if (productData.productInfo) {
                setProductInfo(productData.productInfo);
            }

        } catch (error) {
            console.error('Error fetching product:', error);
            toast.error('Failed to load product details');
        } finally {
            setLoading(false);
            setLoadingCategories(false);
        }
    };

    const getCategoriesData = async () => {
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

            // Merge & Filter
            // For EDIT page, we do allow deleted categories to be fetched so we can display them if the product relies on them
            // But we can filter defaults.
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
            });

            // Return all, let UI handle display logic if needed (e.g. show " (Deleted)" suffix)
            return mergedCategories;

        } catch (error) {
            console.error('Failed to fetch categories:', error);
            return DEFAULT_CATEGORIES;
        }
    };

    const fetchCategories = async () => {
        // Just a placeholder/alias if needed
    };

    const mapParentToGroup = (parentId: string | undefined | null) => {
        if (!parentId) return null;
        if (parentId === 'printers-group' || parentId === 'memory-storage-group') return 'Memory, Storage & Graphics';
        if (parentId === 'accessories') return 'Accessories';
        return parentId;
    };


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Image Handlers
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setImages(prev => [...prev, ...newFiles]);

            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setImagePreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeNewImage = (index: number) => {
        URL.revokeObjectURL(imagePreviews[index]);
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (index: number) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    // Spec Handlers
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
        console.log('Starting product update...');

        // Strict Category Check
        if (!formData.category) {
            toast.error('Product category is missing. Cannot save.');
            setSubmitting(false);
            return;
        }

        try {
            // 1. Upload NEW Images Sequentially (More reliable)
            let newImageUrls: string[] = [];
            if (images.length > 0) {
                console.log(`Uploading ${images.length} new images...`);

                // Use sequential loop instead of Promise.all to avoid potential race conditions/throttling
                for (let i = 0; i < images.length; i++) {
                    const file = images[i];
                    try {
                        console.log(`Uploading file ${i + 1}/${images.length}: ${file.name}`);

                        // Use /api/upload endpoint (same as Add Product page) to avoid CORS
                        const uploadFormData = new FormData();
                        uploadFormData.append('file', file);

                        const response = await fetch('/api/upload', {
                            method: 'POST',
                            body: uploadFormData,
                        });

                        if (!response.ok) {
                            throw new Error('Upload failed');
                        }

                        const data = await response.json();
                        const url = data.url;

                        console.log(`File ${i + 1} uploaded successfully: ${url}`);
                        newImageUrls.push(url);
                    } catch (uploadError) {
                        console.error(`Failed to upload image ${file.name}:`, uploadError);
                        toast.error(`Failed to upload ${file.name}. Continuing with others...`);
                        // Continue loop even if one fails
                    }
                }
            }

            // Combine existing and new images
            const allImages = [...existingImages, ...newImageUrls];

            // 2. Prepare Data
            let targetCategory = formData.category === 'webcams' ? 'dvd-writers' : formData.category;
            if (targetCategory === 'probook' || targetCategory === 'zbook-firefly') {
                targetCategory = 'laptops';
            }

            const updatedProductInfo = { ...productInfo };
            if (formData.category === 'webcams') {
                updatedProductInfo.othersType = 'webcam';
            } else if (formData.category === 'dvd-writers') {
                updatedProductInfo.othersType = 'dvd';
            }

            let name = formData.name;
            if (formData.category === 'probook' && !name.toLowerCase().includes('hp probook')) {
                name = 'HP ProBook ' + name;
            } else if (formData.category === 'zbook-firefly' && !name.toLowerCase().includes('zbook firefly')) {
                name = 'HP ZBook Firefly ' + name;
            }

            const productData = {
                name,
                brand: formData.brand,
                price: parseFloat(formData.price),
                originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
                stock: parseInt(formData.quantity),
                description: formData.description,
                specs: specs.reduce((acc, spec) => {
                    if (spec.key && spec.value) acc[spec.key] = spec.value;
                    return acc;
                }, {} as Record<string, string>),
                images: allImages,
                updatedAt: new Date().toISOString(),
                updatedBy: adminUser?.username || 'admin',
                productInfo: updatedProductInfo,
                category: targetCategory,
            };

            console.log('Update payload:', productData);

            // 3. Update or move product via server action (Admin SDK)
            const result = await updateProduct(productId, productData, targetCategory, originalCategory);

            if (result.success) {
                toast.success('Product saved successfully!');
                router.push('/admindashboard/products');
            } else {
                throw new Error(result.error);
            }

        } catch (error) {
            console.error('Error updating product:', error);
            if (error instanceof Error) {
                toast.error(`Update failed: ${error.message}`);
            } else {
                toast.error('Failed to update product due to an unknown error.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (notFound) {
        return (
            <div className="max-w-4xl mx-auto py-12 text-center">
                <div className="inline-block p-4 rounded-full bg-red-100 text-red-500 mb-4">
                    <FiAlertCircle size={48} />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Product Not Found</h1>
                <p className="text-gray-500 mb-6">The product you are trying to edit does not exist or has been deleted.</p>
                <Link
                    href="/admindashboard/products"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <FiArrowLeft className="mr-2" /> Back to Products
                </Link>
            </div>
        );
    }

    // Find current category name
    const currentCategory = allCategories.find(c => c.id === formData.category);
    const categoryDisplayName = currentCategory ? currentCategory.name : formData.category;

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admindashboard/products" className="p-2 hover:bg-gray-100 rounded-full dark:hover:bg-gray-800 transition-colors">
                    <FiArrowLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-2xl font-bold dark:text-white">Edit Product</h1>
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
                            required
                            value={formData.category}
                            onChange={handleInputChange}
                            className="w-full p-2.5 rounded-lg border dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select Category</option>

                            {allCategories
                                .filter(cat => cat.id !== 'all' && cat.id !== 'accessories' && !cat.deleted)
                                .map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
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
                        />
                    </div>
                </div>

                {/* Images */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold dark:text-white mb-4">Product Images</h2>

                    {existingImages.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Existing Images</h3>
                            <div className="flex flex-wrap gap-4">
                                {existingImages.map((url, idx) => (
                                    <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 group">
                                        <img src={url} alt={`Existing ${idx}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeExistingImage(idx)}
                                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <FiTrash2 size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Add New Images</h3>
                    <ImageUploadZone
                        images={images}
                        setImages={setImages}
                        imagePreviews={imagePreviews}
                        setImagePreviews={setImagePreviews}
                        maxImages={10 - existingImages.length}
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
                                    placeholder="Key"
                                    value={spec.key}
                                    onChange={(e) => handleSpecChange(idx, 'key', e.target.value)}
                                    className="flex-1 p-2.5 rounded-lg border dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                />
                                <input
                                    type="text"
                                    placeholder="Value"
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
                    <ProductInfoFormSection productInfo={productInfo} setProductInfo={setProductInfo} category={formData.category} />
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
                                <FiSave className="mr-2" /> Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
