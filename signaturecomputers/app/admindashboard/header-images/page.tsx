'use client';

import { useState, useEffect, useRef } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';
import { FiUpload, FiTrash2, FiPlus, FiEdit2, FiSave, FiX, FiMove, FiImage } from 'react-icons/fi';
import { toast } from 'sonner';

interface BrandLogo {
    name: string;
    imageUrl: string;
    order: number;
}

interface HeroImageData {
    imageUrl: string;
    alt: string;
}

const DEFAULT_BRANDS: BrandLogo[] = [
    { name: 'HP Authorized Distributor', imageUrl: '/brands/hp-authorized.png', order: 0 },
    { name: 'HP Amplify', imageUrl: '/brands/hp-amplify.png', order: 1 },
    { name: 'Hewlett Packard Enterprise', imageUrl: '/brands/hpe.png', order: 2 },
    { name: 'HP Business Partner', imageUrl: '/brands/hp-business-partner.png', order: 3 },
    { name: 'Poly', imageUrl: '/brands/poly.png', order: 4 },
    { name: 'Nvidia', imageUrl: '/brands/nvidia.png', order: 5 },
    { name: 'Seagate', imageUrl: '/brands/seagate.png', order: 6 },
    { name: 'Western Digital', imageUrl: '/brands/wd.png', order: 7 },
    { name: 'AMD', imageUrl: '/brands/amd-updated.png', order: 8 },
    { name: 'Intel', imageUrl: '/brands/intel-logo-final.png', order: 9 },
];

export default function HeaderImagesPage() {
    // Hero Image State - default to existing static image
    const [heroImage, setHeroImage] = useState<HeroImageData>({
        imageUrl: '/hero-image-v2.png',
        alt: 'Signature Computers Hero'
    });
    const [heroUploading, setHeroUploading] = useState(false);

    // About Us Image State
    const [aboutImage, setAboutImage] = useState<HeroImageData>({
        imageUrl: '/about-us-workspace.png',
        alt: 'Professional IT Workspace - Signature Computers'
    });
    const [aboutUploading, setAboutUploading] = useState(false);

    // EDM Images State
    const [edmImages, setEdmImages] = useState<HeroImageData[]>([]);
    const [edmUploading, setEdmUploading] = useState(false);


    // Brand Logos State - default to existing static logos
    const [brandLogos, setBrandLogos] = useState<BrandLogo[]>(DEFAULT_BRANDS);
    const [brandsLoading, setBrandsLoading] = useState(true);

    // Edit Modal
    const [editingBrand, setEditingBrand] = useState<BrandLogo | null>(null);
    const [editingIndex, setEditingIndex] = useState<number>(-1);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newBrand, setNewBrand] = useState<BrandLogo>({ name: '', imageUrl: '', order: 0 });
    const [uploadingBrand, setUploadingBrand] = useState(false);

    const heroFileRef = useRef<HTMLInputElement>(null);
    const aboutFileRef = useRef<HTMLInputElement>(null);
    const edmFileRef = useRef<HTMLInputElement>(null);
    const brandFileRef = useRef<HTMLInputElement>(null);
    const editBrandFileRef = useRef<HTMLInputElement>(null);

    // Fetch data on mount
    useEffect(() => {
        fetchHeaderData();
    }, []);

    const fetchHeaderData = async () => {
        try {
            // Fetch hero image
            const heroDoc = await getDoc(doc(db, 'header_settings', 'hero_image'));
            if (heroDoc.exists()) {
                setHeroImage(heroDoc.data() as HeroImageData);
            } else {
                // Set default
                setHeroImage({ imageUrl: '/hero-image-v2.png', alt: 'Signature Computers Hero' });
            }

            // Fetch about image
            const aboutDoc = await getDoc(doc(db, 'header_settings', 'about_image'));
            if (aboutDoc.exists()) {
                setAboutImage(aboutDoc.data() as HeroImageData);
            } else {
                // Set default
                setAboutImage({ imageUrl: '/about-us-workspace.png', alt: 'Professional IT Workspace - Signature Computers' });
            }

            // Fetch edm images
            const edmDoc = await getDoc(doc(db, 'header_settings', 'edm_images'));
            if (edmDoc.exists()) {
                const data = edmDoc.data();
                setEdmImages(data.images || []);
            } else {
                // Check old edm_image for backward compatibility
                const oldEdmDoc = await getDoc(doc(db, 'header_settings', 'edm_image'));
                if (oldEdmDoc.exists() && oldEdmDoc.data().imageUrl) {
                    setEdmImages([oldEdmDoc.data() as HeroImageData]);
                }
            }

            // Fetch brand logos
            const brandsDoc = await getDoc(doc(db, 'header_settings', 'brand_logos'));
            if (brandsDoc.exists()) {
                const data = brandsDoc.data();
                setBrandLogos((data.logos || []).sort((a: BrandLogo, b: BrandLogo) => a.order - b.order));
            } else {
                // Use defaults and save to Firestore
                setBrandLogos(DEFAULT_BRANDS);
                await setDoc(doc(db, 'header_settings', 'brand_logos'), { logos: DEFAULT_BRANDS });
            }
        } catch (error) {
            console.error('Error fetching header data:', error);
            toast.error('Failed to load header data');
        } finally {
            setBrandsLoading(false);
        }
    };

    // Upload image to Cloudinary
    const uploadToCloudinary = async (file: File): Promise<string> => {
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
    };

    // Hero Image Handlers
    const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setHeroUploading(true);
        try {
            const imageUrl = await uploadToCloudinary(file);
            const newHeroImage = { imageUrl, alt: heroImage.alt };
            await setDoc(doc(db, 'header_settings', 'hero_image'), newHeroImage);
            setHeroImage(newHeroImage);
            toast.success('Hero image updated successfully!');
        } catch (error) {
            console.error('Error uploading hero image:', error);
            toast.error('Failed to upload hero image');
        } finally {
            setHeroUploading(false);
        }
    };

    const handleHeroDelete = async () => {
        if (!confirm('Are you sure you want to reset the hero image to default?')) return;

        try {
            const defaultHero = { imageUrl: '/hero-image-v2.png', alt: 'Signature Computers Hero' };
            await setDoc(doc(db, 'header_settings', 'hero_image'), defaultHero);
            setHeroImage(defaultHero);
            toast.success('Hero image reset to default');
        } catch (error) {
            console.error('Error resetting hero image:', error);
            toast.error('Failed to reset hero image');
        }
    };

    // About Us Image Handlers
    const handleAboutUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setAboutUploading(true);
        try {
            const imageUrl = await uploadToCloudinary(file);
            const newAboutImage = { imageUrl, alt: aboutImage.alt };
            await setDoc(doc(db, 'header_settings', 'about_image'), newAboutImage);
            setAboutImage(newAboutImage);
            toast.success('About Us image updated successfully!');
        } catch (error) {
            console.error('Error uploading about image:', error);
            toast.error('Failed to upload About Us image');
        } finally {
            setAboutUploading(false);
        }
    };

    const handleAboutDelete = async () => {
        if (!confirm('Are you sure you want to reset the About Us image to default?')) return;

        try {
            const defaultAbout = { imageUrl: '/about-us-workspace.png', alt: 'Professional IT Workspace - Signature Computers' };
            await setDoc(doc(db, 'header_settings', 'about_image'), defaultAbout);
            setAboutImage(defaultAbout);
            toast.success('About Us image reset to default');
        } catch (error) {
            console.error('Error resetting about image:', error);
            toast.error('Failed to reset About Us image');
        }
    };

    // EDM Images Handlers
    const handleEdmUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setEdmUploading(true);
        try {
            const imageUrl = await uploadToCloudinary(file);
            const newImage = { imageUrl, alt: 'Signature Computers EDM' };
            const updatedImages = [...edmImages, newImage];
            await setDoc(doc(db, 'header_settings', 'edm_images'), { images: updatedImages });
            setEdmImages(updatedImages);
            toast.success('EDM image added successfully!');
        } catch (error) {
            console.error('Error uploading EDM image:', error);
            toast.error('Failed to upload EDM image');
        } finally {
            setEdmUploading(false);
            // Reset input so the same file can be selected again
            if (edmFileRef.current) {
                edmFileRef.current.value = '';
            }
        }
    };

    const handleEdmDelete = async (index: number) => {
        if (!confirm('Are you sure you want to remove this EDM image?')) return;

        try {
            const updatedImages = edmImages.filter((_, i) => i !== index);
            await setDoc(doc(db, 'header_settings', 'edm_images'), { images: updatedImages });
            setEdmImages(updatedImages);
            toast.success('EDM image removed');
        } catch (error) {
            console.error('Error removing EDM image:', error);
            toast.error('Failed to remove EDM image');
        }
    };

    // Brand Logo Handlers
    const handleBrandImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingBrand(true);
        try {
            const imageUrl = await uploadToCloudinary(file);
            if (isEdit && editingBrand) {
                setEditingBrand({ ...editingBrand, imageUrl });
            } else {
                setNewBrand({ ...newBrand, imageUrl });
            }
            toast.success('Image uploaded!');
        } catch (error) {
            console.error('Error uploading brand image:', error);
            toast.error('Failed to upload image');
        } finally {
            setUploadingBrand(false);
        }
    };

    const handleAddBrand = async () => {
        if (!newBrand.name || !newBrand.imageUrl) {
            toast.error('Please provide brand name and image');
            return;
        }

        try {
            const updatedLogos = [...brandLogos, { ...newBrand, order: brandLogos.length }];
            await setDoc(doc(db, 'header_settings', 'brand_logos'), { logos: updatedLogos });
            setBrandLogos(updatedLogos);
            setShowAddModal(false);
            setNewBrand({ name: '', imageUrl: '', order: 0 });
            toast.success('Brand logo added!');
        } catch (error: any) {
            console.error('Error adding brand:', error);
            toast.error('Failed to add brand logo: ' + (error?.message || 'Unknown error'));
        }
    };

    const handleEditBrand = async () => {
        if (!editingBrand) return;

        try {
            const updatedLogos = [...brandLogos];
            updatedLogos[editingIndex] = editingBrand;
            await setDoc(doc(db, 'header_settings', 'brand_logos'), { logos: updatedLogos });
            setBrandLogos(updatedLogos);
            setEditingBrand(null);
            setEditingIndex(-1);
            toast.success('Brand logo updated!');
        } catch (error) {
            console.error('Error updating brand:', error);
            toast.error('Failed to update brand logo');
        }
    };

    const handleDeleteBrand = async (index: number) => {
        if (!confirm('Are you sure you want to delete this brand logo?')) return;

        try {
            const updatedLogos = brandLogos.filter((_, i) => i !== index).map((logo, i) => ({ ...logo, order: i }));
            await setDoc(doc(db, 'header_settings', 'brand_logos'), { logos: updatedLogos });
            setBrandLogos(updatedLogos);
            toast.success('Brand logo deleted!');
        } catch (error) {
            console.error('Error deleting brand:', error);
            toast.error('Failed to delete brand logo');
        }
    };

    const moveBrand = async (index: number, direction: 'up' | 'down') => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= brandLogos.length) return;

        const updatedLogos = [...brandLogos];
        [updatedLogos[index], updatedLogos[newIndex]] = [updatedLogos[newIndex], updatedLogos[index]];
        updatedLogos.forEach((logo, i) => logo.order = i);

        try {
            await setDoc(doc(db, 'header_settings', 'brand_logos'), { logos: updatedLogos });
            setBrandLogos(updatedLogos);
        } catch (error) {
            console.error('Error reordering brands:', error);
            toast.error('Failed to reorder');
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                    <FiImage className="text-blue-600" />
                    Header Images
                </h1>
                <p className="text-sm text-gray-500 mt-1">Manage your hero section image and brand logos</p>
            </div>

            {/* Hero Image Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold mb-4 dark:text-white">Hero Image</h2>
                <p className="text-sm text-gray-500 mb-4">This is the main image displayed in the hero section of your homepage.</p>

                <div className="flex flex-col md:flex-row gap-6">
                    {/* Preview */}
                    <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden relative aspect-video max-w-md">
                        {heroImage.imageUrl && (
                            <Image
                                src={heroImage.imageUrl}
                                alt={heroImage.alt}
                                fill
                                className="object-contain"
                            />
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                        <input
                            ref={heroFileRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleHeroUpload}
                        />
                        <button
                            onClick={() => heroFileRef.current?.click()}
                            disabled={heroUploading}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            <FiUpload className="mr-2" />
                            {heroUploading ? 'Uploading...' : 'Change Image'}
                        </button>
                        <button
                            onClick={handleHeroDelete}
                            className="flex items-center px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                            <FiTrash2 className="mr-2" />
                            Reset to Default
                        </button>
                    </div>
                </div>
            </div>

            {/* About Us Image Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold mb-4 dark:text-white">About Us Image</h2>
                <p className="text-sm text-gray-500 mb-4">This image is displayed in the About Us section of your homepage.</p>

                <div className="flex flex-col md:flex-row gap-6">
                    {/* Preview */}
                    <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden relative aspect-[4/3] max-w-md">
                        {aboutImage.imageUrl && (
                            <Image
                                src={aboutImage.imageUrl}
                                alt={aboutImage.alt}
                                fill
                                className="object-cover"
                            />
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                        <input
                            ref={aboutFileRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAboutUpload}
                        />
                        <button
                            onClick={() => aboutFileRef.current?.click()}
                            disabled={aboutUploading}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            <FiUpload className="mr-2" />
                            {aboutUploading ? 'Uploading...' : 'Change Image'}
                        </button>
                        <button
                            onClick={handleAboutDelete}
                            className="flex items-center px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                            <FiTrash2 className="mr-2" />
                            Reset to Default
                        </button>
                    </div>
                </div>
            </div>

            {/* EDM Images Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-lg font-semibold dark:text-white">EDM Images (Hero Carousel)</h2>
                        <p className="text-sm text-gray-500">These images are displayed as slides in the hero carousel, right after the main hero slide.</p>
                    </div>
                    <div>
                        <input
                            ref={edmFileRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleEdmUpload}
                        />
                        <button
                            onClick={() => edmFileRef.current?.click()}
                            disabled={edmUploading}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            <FiPlus className="mr-2" />
                            {edmUploading ? 'Uploading...' : 'Add EDM Image'}
                        </button>
                    </div>
                </div>

                {edmImages.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
                        No EDM images added yet. Click "Add EDM Image" to upload one.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {edmImages.map((img, index) => (
                            <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                                <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
                                    <Image
                                        src={img.imageUrl}
                                        alt={`EDM Image ${index + 1}`}
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                                <div className="p-3 flex justify-between items-center bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Slide {index + 1}</span>
                                    <button
                                        onClick={() => handleEdmDelete(index)}
                                        className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                                        title="Remove image"
                                    >
                                        <FiTrash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Brand Logos Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-lg font-semibold dark:text-white">Brand Logos</h2>
                        <p className="text-sm text-gray-500">These logos appear in the marquee below the hero section.</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <FiPlus className="mr-2" />
                        Add Logo
                    </button>
                </div>

                {brandsLoading ? (
                    <div className="text-center py-8 text-gray-500">Loading...</div>
                ) : (
                    <div className="space-y-3">
                        {brandLogos.map((brand, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                            >
                                {/* Reorder Controls */}
                                <div className="flex flex-col gap-1">
                                    <button
                                        onClick={() => moveBrand(index, 'up')}
                                        disabled={index === 0}
                                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                    >
                                        ▲
                                    </button>
                                    <button
                                        onClick={() => moveBrand(index, 'down')}
                                        disabled={index === brandLogos.length - 1}
                                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                    >
                                        ▼
                                    </button>
                                </div>

                                {/* Logo Preview */}
                                <div className="w-24 h-12 bg-white rounded border relative flex-shrink-0">
                                    <Image
                                        src={brand.imageUrl}
                                        alt={brand.name}
                                        fill
                                        className="object-contain p-1"
                                    />
                                </div>

                                {/* Brand Name */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 dark:text-white truncate">{brand.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{brand.imageUrl}</p>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => { setEditingBrand(brand); setEditingIndex(index); }}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <FiEdit2 />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteBrand(index)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Brand Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold dark:text-white">Add Brand Logo</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                                <FiX size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Brand Name</label>
                                <input
                                    type="text"
                                    value={newBrand.name}
                                    onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="e.g. HP Authorized"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Logo Image</label>
                                <input
                                    ref={brandFileRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleBrandImageUpload(e, false)}
                                />
                                {newBrand.imageUrl ? (
                                    <div className="flex items-center gap-3">
                                        <div className="w-20 h-10 bg-gray-100 rounded border relative">
                                            <Image src={newBrand.imageUrl} alt="Preview" fill className="object-contain p-1" />
                                        </div>
                                        <button
                                            onClick={() => brandFileRef.current?.click()}
                                            className="text-sm text-blue-600 hover:underline"
                                        >
                                            Change
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => brandFileRef.current?.click()}
                                        disabled={uploadingBrand}
                                        className="w-full py-8 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors"
                                    >
                                        {uploadingBrand ? 'Uploading...' : 'Click to upload image'}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddBrand}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Add Logo
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Brand Modal */}
            {editingBrand && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold dark:text-white">Edit Brand Logo</h3>
                            <button onClick={() => { setEditingBrand(null); setEditingIndex(-1); }} className="text-gray-400 hover:text-gray-600">
                                <FiX size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Brand Name</label>
                                <input
                                    type="text"
                                    value={editingBrand.name}
                                    onChange={(e) => setEditingBrand({ ...editingBrand, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Logo Image</label>
                                <input
                                    ref={editBrandFileRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleBrandImageUpload(e, true)}
                                />
                                <div className="flex items-center gap-3">
                                    <div className="w-20 h-10 bg-gray-100 rounded border relative">
                                        <Image src={editingBrand.imageUrl} alt="Preview" fill className="object-contain p-1" />
                                    </div>
                                    <button
                                        onClick={() => editBrandFileRef.current?.click()}
                                        disabled={uploadingBrand}
                                        className="text-sm text-blue-600 hover:underline"
                                    >
                                        {uploadingBrand ? 'Uploading...' : 'Change Image'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => { setEditingBrand(null); setEditingIndex(-1); }}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEditBrand}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
