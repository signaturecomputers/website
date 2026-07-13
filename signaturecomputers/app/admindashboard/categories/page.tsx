'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';

import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import {
    FiPlus,
    FiEdit2,
    FiTrash2,
    FiImage,
    FiX,
    FiSave,
    FiChevronDown,
    FiChevronRight
} from 'react-icons/fi';
import {
    Laptop,
    Monitor,
    Printer,
    Keyboard,
    Mouse,
    Headphones,
    Cable,
    BatteryCharging,
    Briefcase,
    Disc,
    Usb,
    Package,
    Server,
    Camera,
    ShoppingBag,
    Grid3X3,
    Cpu,
    HardDrive
} from 'lucide-react';

// Main categories with their default local images
const MAIN_CATEGORIES = [
    { id: 'laptops', name: 'Laptops', icon: Laptop, defaultImage: '/images/categories/laptops.jpg', description: 'High-performance laptops for all needs' },
    { id: 'desktops', name: 'Desktops', icon: Monitor, defaultImage: '/images/categories/desktops.jpg', description: 'Custom-built and branded desktops' },
    { id: 'workstations', name: 'Workstations', icon: Server, defaultImage: '/images/categories/workstations.jpg', description: 'Power-house rigs for professionals' },
    { id: 'monitors', name: 'Monitors', icon: Monitor, defaultImage: '/images/categories/monitors.jpg', description: 'Crisp displays for work and gaming' },
    { id: 'memory-storage', name: 'Memory, Storage & Graphics', icon: HardDrive, defaultImage: '/images/categories/memory-storage.jpg', description: 'High-speed memory, storage and graphics solutions', hasSubcategories: true },
    { id: 'accessories', name: 'Accessories', icon: ShoppingBag, defaultImage: '/images/categories/accessories.png', description: 'Keyboards, mice, and more', hasSubcategories: true },
    { id: 'cctv', name: 'CCTV', icon: Camera, defaultImage: '/images/categories/cctv.jpg', description: 'Advanced security systems' },
];

// Subcategories under Memory & Storage
const MEMORY_STORAGE_SUBCATEGORIES = [
    { id: 'memory', name: 'Memory', parentId: 'memory-storage-group', icon: Cpu, defaultImage: '', description: 'High-speed DDR4 & DDR5 RAM' },
    { id: 'storage', name: 'Storage', parentId: 'memory-storage-group', icon: HardDrive, defaultImage: '', description: 'Internal NVMe SSDs & External Drives' },
    { id: 'graphics-cards', name: 'Graphics Cards', parentId: 'memory-storage-group', icon: Cpu, defaultImage: '', description: 'Nvidia GeForce & AMD Radeon GPUs' },
];

// Subcategories under Accessories with their default local images
const ACCESSORY_SUBCATEGORIES = [
    { id: 'keyboards', name: 'Keyboards', parentId: 'accessories', icon: Keyboard, defaultImage: '/images/subcategories/keyboards.jpg', description: 'Mechanical and membrane keyboards' },
    { id: 'mouse', name: 'Mouse', parentId: 'accessories', icon: Mouse, defaultImage: '/images/subcategories/mouse.jpg', description: 'Wired and wireless mouse' },
    { id: 'keyboard-mouse-combo', name: 'Keyboard & Mouse Combo', parentId: 'accessories', icon: Grid3X3, defaultImage: '/images/subcategories/keyboard-mouse-combo.jpg', description: 'Complete keyboard and mouse sets' },
    { id: 'headphones', name: 'Headphones', parentId: 'accessories', icon: Headphones, defaultImage: '/images/subcategories/headphones.jpg', description: 'Headsets and earphones' },
    { id: 'cables', name: 'Cables', parentId: 'accessories', icon: Cable, defaultImage: '/images/subcategories/cables.jpg', description: 'HDMI, DP, VGA, and RJ45 connector' },
    { id: 'power-adapters', name: 'Power Adapters', parentId: 'accessories', icon: BatteryCharging, defaultImage: '/images/subcategories/power-adapters.jpg', description: 'Chargers and power supplies' },
    { id: 'bags', name: 'Bags', parentId: 'accessories', icon: Briefcase, defaultImage: '/images/subcategories/bags.jpg', description: 'Laptop bags and backpacks' },
    { id: 'docks', name: 'Docks', parentId: 'accessories', icon: Monitor, defaultImage: '/images/subcategories/docks-v3.jpg', description: 'USB-C docks and hubs' },
    { id: 'usb-flashdrives', name: 'USB Flash Drives', parentId: 'accessories', icon: Usb, defaultImage: '/images/subcategories/usb-flashdrives-v4.jpg', description: 'Portable storage devices' },
    { id: 'dvd-writers', name: 'Others', parentId: 'accessories', icon: Disc, defaultImage: '/images/subcategories/dvd-writers.jpg', description: 'DVD, Webcam, etc.' },
];

interface CategoryData {
    id: string;
    name: string;
    description?: string;
    image?: string;
    parentId?: string | null;
    isCustom?: boolean;
    deleted?: boolean;
    order?: number;
}

export default function CategoriesPage() {
    const router = useRouter();
    const [productCounts, setProductCounts] = useState<Record<string, number>>({});
    const [categoryMetadata, setCategoryMetadata] = useState<Record<string, CategoryData>>({});
    const [customCategories, setCustomCategories] = useState<CategoryData[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedGroups, setExpandedGroups] = useState<string[]>(['main', 'memory-storage', 'accessories']);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<'edit' | 'add'>('edit');
    const [editingCategory, setEditingCategory] = useState<CategoryData | null>(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        description: '',
        image: '',
        parentId: '',
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch product counts for all categories
            const allCategoryIds = [
                ...MAIN_CATEGORIES.map(c => c.id),
                ...MEMORY_STORAGE_SUBCATEGORIES.map(c => c.id),
                ...ACCESSORY_SUBCATEGORIES.map(c => c.id),
            ];

            const counts: Record<string, number> = {};
            for (const catId of allCategoryIds) {
                try {
                    const snapshot = await getDocs(collection(db, catId));
                    counts[catId] = snapshot.docs.length;
                } catch {
                    counts[catId] = 0;
                }
            }
            setProductCounts(counts);

            // Fetch category metadata (custom images/descriptions)
            try {
                const metadataSnapshot = await getDocs(collection(db, 'category_metadata'));
                const metadata: Record<string, CategoryData> = {};
                metadataSnapshot.docs.forEach(doc => {
                    metadata[doc.id] = { id: doc.id, ...doc.data() } as CategoryData;
                });
                setCategoryMetadata(metadata);
            } catch (error) {
                console.error('Failed to fetch category metadata:', error);
            }

            // Fetch custom categories
            try {
                const customCatsSnapshot = await getDocs(collection(db, 'custom_categories'));
                const customs = customCatsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    isCustom: true,
                    ...doc.data()
                })) as CategoryData[];
                setCustomCategories(customs);
            } catch (error) {
                console.error('Failed to fetch custom categories:', error);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryClick = (categoryId: string) => {
        router.push(`/admindashboard/products?category=${categoryId}`);
    };

    const toggleGroup = (group: string) => {
        setExpandedGroups(prev =>
            prev.includes(group)
                ? prev.filter(g => g !== group)
                : [...prev, group]
        );
    };

    // Open Add Modal
    const openAddModal = (parentId?: string) => {
        setModalMode('add');
        setEditingCategory(null);
        setFormData({
            id: '',
            name: '',
            description: '',
            image: '',
            parentId: parentId || '',
        });
        setImagePreview('');
        setImageFile(null);
        setShowModal(true);
    };

    // Open Edit Modal
    const openEditModal = (category: { id: string; name: string; defaultImage?: string; description?: string }) => {
        const metadata = categoryMetadata[category.id];
        setModalMode('edit');
        setEditingCategory({
            id: category.id,
            name: category.name,
            description: metadata?.description || category.description || '',
            image: metadata?.image || category.defaultImage || '',
        });
        setFormData({
            id: category.id,
            name: category.name,
            description: metadata?.description || category.description || '',
            image: metadata?.image || category.defaultImage || '',
            parentId: '',
        });
        setImagePreview(metadata?.image || category.defaultImage || '');
        setImageFile(null);
        setShowModal(true);
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const generateSlug = (name: string) => {
        return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    };

    const handleSave = async () => {
        if (modalMode === 'add' && !formData.name.trim()) {
            toast.error('Category name is required');
            return;
        }

        setSaving(true);
        try {
            let imageUrl = formData.image;

            // Upload new image if selected
            if (imageFile) {
                const uploadFormData = new FormData();
                uploadFormData.append('file', imageFile);

                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: uploadFormData,
                });

                if (!response.ok) {
                    throw new Error('Failed to upload image');
                }

                const data = await response.json();
                imageUrl = data.url;
            }

            if (modalMode === 'add') {
                // Create new category
                const slug = generateSlug(formData.name);
                const newCategory = {
                    name: formData.name.trim(),
                    description: formData.description,
                    image: imageUrl,
                    parentId: formData.parentId || null,
                    isCustom: true,
                    createdAt: new Date(),
                };

                await setDoc(doc(db, 'custom_categories', slug), newCategory);

                // Also save to category_metadata
                await setDoc(doc(db, 'category_metadata', slug), {
                    name: formData.name.trim(),
                    description: formData.description,
                    image: imageUrl,
                    updatedAt: new Date(),
                });

                toast.success('Category created successfully');
            } else {
                // Update existing category metadata - save name, description, and image
                await setDoc(doc(db, 'category_metadata', editingCategory!.id), {
                    name: formData.name.trim(),
                    description: formData.description,
                    image: imageUrl,
                    updatedAt: new Date(),
                }, { merge: true });

                toast.success('Category updated successfully');
            }

            setShowModal(false);
            fetchData();
        } catch (error) {
            console.error('Failed to save category:', error);
            toast.error('Failed to save category');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (category: CategoryData) => {
        const displayName = categoryMetadata[category.id]?.name || category.name;

        if (!confirm(`Delete "${displayName}" from the website? You can restore it later.`)) return;

        try {
            if (category.isCustom) {
                // For custom categories, delete from custom_categories collection
                await deleteDoc(doc(db, 'custom_categories', category.id));
            }

            // Mark as deleted in category_metadata (for all categories)
            await setDoc(doc(db, 'category_metadata', category.id), {
                name: displayName,
                deleted: true,
                updatedAt: new Date(),
            }, { merge: true });

            toast.success(`"${displayName}" deleted from website`);
            fetchData();
        } catch (error) {
            console.error('Failed to delete category:', error);
            toast.error('Failed to delete category');
        }
    };

    // Restore a deleted category
    const handleRestore = async (categoryId: string) => {
        try {
            await updateDoc(doc(db, 'category_metadata', categoryId), {
                deleted: false,
                updatedAt: new Date(),
            });
            toast.success('Category restored');
            fetchData();
        } catch (error) {
            console.error('Failed to restore category:', error);
            toast.error('Failed to restore category');
        }
    };

    // Get display image for a category
    const getDisplayImage = (category: { id: string; defaultImage?: string }) => {
        const metadata = categoryMetadata[category.id];
        return metadata?.image || category.defaultImage || '';
    };

    // Get display description for a category
    const getDisplayDescription = (category: { id: string; description?: string }) => {
        const metadata = categoryMetadata[category.id];
        return metadata?.description || category.description || '';
    };

    // Render a category card
    const renderCategoryCard = (category: { id: string; name: string; icon?: any; defaultImage?: string; description?: string; isCustom?: boolean }) => {
        const Icon = category.icon || Package;
        const count = productCounts[category.id] || 0;
        const displayImage = getDisplayImage(category);
        const displayDescription = getDisplayDescription(category);
        const metadata = categoryMetadata[category.id];
        const displayName = metadata?.name || category.name;

        return (
            <div
                key={category.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-lg transition-all group"
            >
                {/* Image/Icon Area */}
                <div
                    className="h-36 bg-gray-100 dark:bg-gray-700 flex items-center justify-center cursor-pointer relative overflow-hidden"
                    onClick={() => handleCategoryClick(category.id)}
                >
                    {displayImage ? (
                        <img
                            src={displayImage}
                            alt={displayName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <Icon className="w-10 h-10 text-gray-400" />
                            <span className="text-xs text-gray-400">No Image</span>
                        </div>
                    )}
                    {category.isCustom && (
                        <span className="absolute top-2 right-2 px-2 py-0.5 bg-purple-500 text-white text-xs rounded-full">
                            Custom
                        </span>
                    )}
                </div>

                {/* Content */}
                <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">{displayName}</h3>
                    {displayDescription && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{displayDescription}</p>
                    )}
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">
                        {loading ? '...' : `${count} products`}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-3">
                        <button
                            onClick={() => openEditModal(category)}
                            className="flex-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 rounded-lg transition-colors flex items-center justify-center gap-1"
                        >
                            <FiEdit2 className="w-3 h-3" /> Edit
                        </button>
                        <button
                            onClick={() => handleDelete({ id: category.id, name: displayName, isCustom: category.isCustom })}
                            className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-lg transition-colors flex items-center justify-center gap-1"
                            title="Delete Category"
                        >
                            <FiTrash2 className="w-3 h-3" /> Delete
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Render section header with add button
    const renderSectionHeader = (title: string, group: string, icon: any, parentId?: string) => {
        const Icon = icon;
        const isExpanded = expandedGroups.includes(group);

        return (
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={() => toggleGroup(group)}
                    className="flex items-center gap-2 text-lg font-semibold dark:text-white hover:text-blue-600 transition-colors"
                >
                    {isExpanded ? <FiChevronDown className="w-5 h-5" /> : <FiChevronRight className="w-5 h-5" />}
                    <Icon className="w-5 h-5 text-blue-600" />
                    {title}
                </button>
                <button
                    onClick={() => openAddModal(parentId)}
                    className="px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 rounded-lg transition-colors flex items-center gap-1"
                >
                    <FiPlus className="w-3 h-3" /> Add {parentId ? 'Subcategory' : 'Category'}
                </button>
            </div>
        );
    };

    // Check if category is deleted
    const isDeleted = (categoryId: string) => {
        return categoryMetadata[categoryId]?.deleted === true;
    };

    // Get custom subcategories for a parent (filter out deleted ones)
    const getCustomSubcategories = (parentId: string) => {
        return customCategories.filter(c => c.parentId === parentId && !c.deleted);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white">Categories</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Manage category images, descriptions, and create new categories
                    </p>
                </div>
                <button
                    onClick={() => openAddModal()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                    <FiPlus /> Add Main Category
                </button>
            </div>

            {/* Main Categories Section */}
            <div>
                {renderSectionHeader('Main Categories', 'main', Laptop)}
                {expandedGroups.includes('main') && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {MAIN_CATEGORIES.filter(cat => !isDeleted(cat.id)).map(cat => renderCategoryCard(cat))}
                        {/* Custom main categories */}
                        {customCategories.filter(c => !c.parentId && !c.deleted).map(cat => renderCategoryCard({ ...cat, isCustom: true }))}
                    </div>
                )}
            </div>

            {/* Memory & Storage Section */}
            <div>
                {renderSectionHeader('Memory, Storage & Graphics', 'memory-storage', HardDrive, 'memory-storage-group')}
                {expandedGroups.includes('memory-storage') && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {MEMORY_STORAGE_SUBCATEGORIES.filter(cat => !isDeleted(cat.id)).map(cat => renderCategoryCard(cat))}
                        {/* Custom memory/storage subcategories */}
                        {getCustomSubcategories('memory-storage-group').map(cat => renderCategoryCard({ ...cat, isCustom: true }))}
                    </div>
                )}
            </div>

            {/* Accessories Section */}
            <div>
                {renderSectionHeader('Accessories', 'accessories', ShoppingBag, 'accessories')}
                {expandedGroups.includes('accessories') && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {ACCESSORY_SUBCATEGORIES.filter(cat => !isDeleted(cat.id)).map(cat => renderCategoryCard(cat))}
                        {/* Custom accessory subcategories */}
                        {getCustomSubcategories('accessories').map(cat => renderCategoryCard({ ...cat, isCustom: true }))}
                    </div>
                )}
            </div>

            {/* Deleted Categories Section - REMOVED AS REQUESTED */}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                            <h2 className="text-lg font-bold dark:text-white">
                                {modalMode === 'add' ? 'Add New Category' : `Edit ${editingCategory?.name}`}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Category Name - Editable in both modes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Category Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full p-3 rounded-lg border dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g. Gaming Laptops"
                                />
                                {modalMode === 'edit' && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Original: {editingCategory?.name} (ID: {editingCategory?.id})
                                    </p>
                                )}
                            </div>

                            {/* Parent Category (for Add mode) */}
                            {modalMode === 'add' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Parent Category
                                    </label>
                                    <select
                                        value={formData.parentId}
                                        onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                                        className="w-full p-3 rounded-lg border dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">None (Main Category)</option>
                                        <option value="memory-storage-group">Memory, Storage & Graphics</option>
                                        <option value="accessories">Accessories</option>
                                        {MAIN_CATEGORIES.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Leave empty to create a main category
                                    </p>
                                </div>
                            )}

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Category Image
                                </label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl h-48 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors overflow-hidden"
                                >
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <>
                                            <FiImage className="w-12 h-12 text-gray-400 mb-2" />
                                            <p className="text-sm text-gray-500">Click to upload image</p>
                                            <p className="text-xs text-gray-400 mt-1">Recommended: 800x400px</p>
                                        </>
                                    )}
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                    className="hidden"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Description
                                </label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full p-3 rounded-lg border dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g. High-performance laptops for all needs"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 transition-colors"
                            >
                                {saving ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <FiSave className="w-4 h-4" />
                                        {modalMode === 'add' ? 'Create Category' : 'Save Changes'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
