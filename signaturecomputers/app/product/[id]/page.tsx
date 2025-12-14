'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { FiStar, FiShoppingCart, FiHeart, FiShare2 } from 'react-icons/fi';
import { getProductById, Product } from '@/lib/products';
import { toast } from 'sonner';
import ProductInfoSection from '@/components/ProductInfoSection';
import { useAdminAuth } from '@/context/AdminAuthContext';

export default function ProductDetailsPage() {
    const params = useParams();
    const id = params.id as string;

    // Get admin status from context (AdminAuthProvider wraps the entire app)
    const { adminUser } = useAdminAuth();
    const isAdmin = !!adminUser;

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('description');
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState('');

    useEffect(() => {
        async function loadProduct() {
            setLoading(true);
            const data = await getProductById(id);
            if (data) {
                setProduct(data);
                setActiveImage(data.images?.[0] || '');
            } else {
                toast.error('Product not found');
            }
            setLoading(false);
        }
        if (id) {
            loadProduct();
        }
    }, [id]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!product) {
        return <div className="min-h-screen flex items-center justify-center">Product not found.</div>;
    }

    return (
        <div className="bg-white dark:bg-black min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        <div className="aspect-square bg-gray-100 dark:bg-gray-900 rounded-2xl overflow-hidden flex items-center justify-center">
                            {activeImage ? (
                                <img src={activeImage} alt={product.name} className="w-full h-full object-contain" />
                            ) : (
                                <span className="text-gray-400">No Image</span>
                            )}
                        </div>
                        {product.images && product.images.length > 1 && (
                            <div className="grid grid-cols-4 gap-4">
                                {product.images.map((img, i) => (
                                    <div
                                        key={i}
                                        onClick={() => setActiveImage(img)}
                                        className={`aspect-square bg-gray-100 dark:bg-gray-900 rounded-lg cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all flex items-center justify-center overflow-hidden ${activeImage === img ? 'ring-2 ring-blue-500' : ''}`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div>
                        <div className="mb-2">
                            <span className="text-blue-600 font-medium">{product.brand}</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{product.name}</h1>

                        <div className="flex items-center mb-6">
                            <div className="flex text-yellow-400 mr-2">
                                {[...Array(5)].map((_, i) => (
                                    <FiStar key={i} className={i < 4 ? "fill-current" : ""} /> // Hardcoded rating for now
                                ))}
                            </div>
                            <span className="text-sm text-gray-500">(12 reviews)</span>
                        </div>

                        <div className="flex items-end gap-4 mb-8">
                            <span className="text-4xl font-bold text-gray-900 dark:text-white">₹{product.price.toLocaleString()}</span>
                            {product.originalPrice && (
                                <span className="text-xl text-gray-500 line-through mb-1">₹{product.originalPrice.toLocaleString()}</span>
                            )}
                        </div>

                        <div className="space-y-6 border-t border-b border-gray-100 dark:border-gray-800 py-6 mb-8">
                            {product.stock <= 0 ? (
                                <p className="text-sm font-medium text-red-600">Out of Stock</p>
                            ) : product.stock <= 5 ? (
                                <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                                    <span className="text-amber-600 dark:text-amber-400 text-lg">⚠️</span>
                                    <div>
                                        <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                                            Only {product.stock} left in stock!
                                        </p>
                                        <p className="text-xs text-amber-600 dark:text-amber-400">
                                            Hurry, products are running out - order soon!
                                        </p>
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="flex items-center border border-gray-300 rounded-md dark:border-gray-700">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800">-</button>
                                <span className="px-4 py-3 font-medium border-l border-r border-gray-300 dark:border-gray-700">{quantity}</span>
                                <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800">+</button>
                            </div>
                            <button
                                disabled={product.stock <= 0}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-md flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FiShoppingCart className="mr-2" /> {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                            </button>
                            <button className="p-3 border border-gray-300 rounded-md hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                                <FiHeart className="text-xl" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mt-16">
                    <div className="border-b border-gray-200 dark:border-gray-800">
                        <nav className="-mb-px flex space-x-8">
                            {['description', 'specifications', 'product info'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`${activeTab === tab
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </nav>
                    </div>
                    <div className="mt-8">
                        {activeTab === 'description' && (
                            <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
                                <p>{product.description}</p>
                            </div>
                        )}
                        {activeTab === 'specifications' && (
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
                                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                    {product.specs && Object.entries(product.specs).map(([key, value]) => (
                                        <div key={key}>
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{key}</dt>
                                            <dd className="mt-1 text-sm text-gray-900 dark:text-white font-semibold">{value}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </div>
                        )}
                        {activeTab === 'product info' && (
                            <ProductInfoSection productInfo={product.productInfo} isAdmin={isAdmin} />
                        )}
                    </div>
                </div>

                {/* Related Products Section (Placeholder for now) */}
                <div className="mt-20 border-t border-gray-200 dark:border-gray-800 pt-16">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Related Products</h2>
                    <p className="text-gray-500">Coming soon...</p>
                </div>

            </div>
        </div>
    );
}
