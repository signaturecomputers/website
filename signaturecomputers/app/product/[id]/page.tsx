'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiStar, FiShoppingCart, FiHeart, FiCreditCard, FiChevronDown } from 'react-icons/fi';
import { getProductById, Product } from '@/lib/products';
import { toast } from 'sonner';
import ProductInfoSection from '@/components/ProductInfoSection';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

export default function ProductDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const { adminUser } = useAdminAuth();
    const isAdmin = !!adminUser;
    const { user } = useAuth();
    const { addToCart, saveForLater, isInSaved } = useCart();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('description');
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState('');
    const [isSaved, setIsSaved] = useState(false);

    const handleBuyNow = () => {
        if (!user) {
            toast.error('Please login to checkout');
            router.push('/login');
            return;
        }
        if (product) {
            addToCart({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.images?.[0] || '',
                quantity: quantity
            });
            router.push('/checkout');
        }
    };

    const handleAddToCart = () => {
        if (product) {
            addToCart({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.images?.[0] || '',
                quantity: quantity
            });
            toast.success('Added to cart!', {
                description: `${product.name} (Qty: ${quantity})`,
                duration: 3000,
            });
        }
    };

    const handleSaveForLater = () => {
        if (product) {
            saveForLater({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.images?.[0] || '',
            });
            setIsSaved(true);
            toast.success('Saved for later!', {
                description: 'View in your cart under "Saved Items"',
                duration: 3000,
            });
        }
    };

    const scrollToSpecs = () => {
        setActiveTab('specifications');
        const specsSection = document.getElementById('product-tabs');
        if (specsSection) {
            specsSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const getKeySpecs = () => {
        if (!product?.specs) return [];
        const entries = Object.entries(product.specs);
        return entries.slice(0, 5);
    };

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

    useEffect(() => {
        if (product) {
            setIsSaved(isInSaved(product.id));
        }
    }, [product, isInSaved]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!product) {
        return <div className="min-h-screen flex items-center justify-center">Product not found.</div>;
    }

    const keySpecs = getKeySpecs();
    const hasMultipleImages = product.images && product.images.length > 1;

    return (
        <div className="bg-white dark:bg-black min-h-screen py-12">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:pl-2 lg:pr-4">
                {/* Main Layout with thumbnails at far left */}
                <div className="flex gap-2">
                    {/* Thumbnails at far left edge - aligned with navbar logo */}
                    {hasMultipleImages && (
                        <div className="hidden lg:flex flex-col gap-3 w-16 flex-shrink-0 -ml-14">
                            {product.images!.map((img, i) => (
                                <div
                                    key={i}
                                    onClick={() => setActiveImage(img)}
                                    className={`w-16 h-16 bg-gray-100 dark:bg-gray-900 rounded-lg cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all flex items-center justify-center overflow-hidden ${activeImage === img ? 'ring-2 ring-blue-500' : 'border border-gray-200 dark:border-gray-700'}`}
                                >
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Main content grid - Image takes more space */}
                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8">
                        {/* Main Image - Scales up/down to fill 4:3 container, no card styling */}
                        <div className="aspect-[4/3]">
                            {activeImage ? (
                                <img src={activeImage} alt={product.name} className="w-full h-full object-contain" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <span className="text-gray-400">No Image</span>
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div>
                            {/* Mobile Thumbnails */}
                            {hasMultipleImages && (
                                <div className="flex lg:hidden gap-2 mb-4 flex-wrap">
                                    {product.images!.map((img, i) => (
                                        <div
                                            key={i}
                                            onClick={() => setActiveImage(img)}
                                            className={`w-14 h-14 bg-gray-100 dark:bg-gray-900 rounded-lg cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all flex items-center justify-center overflow-hidden ${activeImage === img ? 'ring-2 ring-blue-500' : 'border border-gray-200 dark:border-gray-700'}`}
                                        >
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="mb-2">
                                <span className="text-blue-600 font-medium">{product.brand}</span>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{product.name}</h1>

                            <div className="flex items-center mb-4">
                                <div className="flex text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                        <FiStar key={i} className={i < 4 ? "fill-current" : ""} />
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-end gap-4 mb-4">
                                <span className="text-4xl font-bold text-gray-900 dark:text-white">₹{product.price.toLocaleString()}</span>
                                {product.originalPrice && (
                                    <span className="text-xl text-gray-500 line-through mb-1">₹{product.originalPrice.toLocaleString()}</span>
                                )}
                            </div>

                            {/* Key Specifications Preview */}
                            {keySpecs.length > 0 && (
                                <div className="border-t border-gray-100 dark:border-gray-800 pt-4 mb-4">
                                    <div className="space-y-1.5">
                                        {keySpecs.map(([key, value]) => (
                                            <p key={key} className="text-sm text-gray-500 dark:text-gray-400">
                                                {value}
                                            </p>
                                        ))}
                                    </div>
                                    <button
                                        onClick={scrollToSpecs}
                                        className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
                                    >
                                        See more specifications
                                        <FiChevronDown size={14} />
                                    </button>
                                </div>
                            )}

                            <div className="border-t border-gray-100 dark:border-gray-800 pt-4 mb-4">
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

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3 flex-wrap">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={product.stock <= 0}
                                    className="flex-1 min-w-[140px] bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FiShoppingCart className="mr-2" /> {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                                </button>

                                <button
                                    onClick={handleBuyNow}
                                    disabled={product.stock <= 0}
                                    className="flex-1 min-w-[140px] bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-md flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FiCreditCard className="mr-2" /> Buy Now
                                </button>

                                <div className="flex items-center border border-gray-300 rounded-md dark:border-gray-700">
                                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 text-lg">-</button>
                                    <span className="px-3 py-2.5 font-medium border-l border-r border-gray-300 dark:border-gray-700 min-w-[40px] text-center">{quantity}</span>
                                    <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 text-lg">+</button>
                                </div>

                                <button
                                    onClick={handleSaveForLater}
                                    className={`p-3 border rounded-md transition-colors ${isSaved
                                        ? 'border-red-300 bg-red-50 text-red-500 dark:bg-red-900/20 dark:border-red-800'
                                        : 'border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    <FiHeart className={`text-xl ${isSaved ? 'fill-current' : ''}`} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div id="product-tabs" className="mt-16">
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

                {/* Related Products Section */}
                <div className="mt-20 border-t border-gray-200 dark:border-gray-800 pt-16">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Related Products</h2>
                    <p className="text-gray-500">Coming soon...</p>
                </div>
            </div>
        </div>
    );
}
