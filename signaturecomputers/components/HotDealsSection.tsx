'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiShoppingCart, FiCheckCircle, FiPackage, FiTruck, FiChevronLeft, FiChevronRight, FiMinus, FiPlus } from 'react-icons/fi';
import { useCart } from '@/context/CartContext';
import { getAllProducts, Product } from '@/lib/products';

interface HotDealsProps {
    mode?: 'home' | 'page';
}

export default function HotDealsSection({ mode = 'home' }: HotDealsProps) {
    const router = useRouter();
    const { addToCart } = useCart();

    // State
    const [deals, setDeals] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [isAutoPlaying, setIsAutoPlaying] = useState(mode === 'home');

    useEffect(() => {
        async function fetchDeals() {
            try {
                const products = await getAllProducts();
                // Filter for products with discounts (originalPrice > price) or just take first 5
                const discounted = products.filter(p => p.originalPrice && p.originalPrice > p.price).slice(0, 5);
                setDeals(discounted.length > 0 ? discounted : products.slice(0, 5));
            } catch (err) {
                console.error("Failed to fetch deals", err);
            } finally {
                setLoading(false);
            }
        }
        fetchDeals();
    }, []);

    const activeDeal = deals[currentSlide];

    const handleCardClick = (id: string) => {
        router.push(`/product/${id}`);
    };

    // Reset internal state when slide changes
    useEffect(() => {
        setActiveImageIndex(0);
        setQuantity(1);
    }, [currentSlide]);

    // Navigation
    const nextSlide = useCallback(() => {
        if (deals.length === 0) return;
        setCurrentSlide((prev) => (prev + 1) % deals.length);
    }, [deals.length]);

    const prevSlide = useCallback(() => {
        if (deals.length === 0) return;
        setCurrentSlide((prev) => (prev - 1 + deals.length) % deals.length);
    }, [deals.length]);

    // Auto-slide
    useEffect(() => {
        if (!isAutoPlaying || deals.length === 0) return;
        const interval = setInterval(nextSlide, 5000);
        return () => clearInterval(interval);
    }, [nextSlide, isAutoPlaying, deals.length]);

    // Handlers
    const handleQuantityChange = (delta: number) => {
        setQuantity(prev => Math.max(1, prev + delta));
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!activeDeal) return;

        addToCart({
            id: activeDeal.id,
            name: activeDeal.name,
            price: activeDeal.price,
            image: activeDeal.images?.[0] || '',
            quantity: quantity
        });
    };

    const handleBuyNow = (e: React.MouseEvent) => {
        e.stopPropagation();
        handleAddToCart(e);
        router.push('/cart');
    };

    // Pause auto-play on hover
    const handleMouseEnter = () => { if (mode === 'home') setIsAutoPlaying(false); };
    const handleMouseLeave = () => { if (mode === 'home') setIsAutoPlaying(true); };

    if (loading) {
        return <div className="py-16 text-center">Loading Deals...</div>;
    }

    if (deals.length === 0) {
        return null;
    }

    return (
        <section
            id="hot-deals"
            className="py-16 bg-white overflow-hidden"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">

                {/* Heading */}
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        {mode === 'page' ? 'Exclusive Hot Deals' : 'Hot Deals'}
                    </h2>
                    <div className="w-16 h-1 bg-blue-600 mx-auto rounded-full mt-2"></div>
                </div>

                {/* Main Content Area - Full Width Slider */}
                <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden min-h-[500px]">

                    {/* Navigation Arrows */}
                    {deals.length > 1 && (
                        <>
                            <button
                                onClick={prevSlide}
                                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/80 shadow-lg hover:bg-white hover:scale-110 transition-all text-gray-700"
                            >
                                <FiChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                                onClick={nextSlide}
                                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/80 shadow-lg hover:bg-white hover:scale-110 transition-all text-gray-700"
                            >
                                <FiChevronRight className="w-6 h-6" />
                            </button>
                        </>
                    )}

                    {/* Content Grid */}
                    <div className="flex flex-col lg:flex-row h-full">

                        {/* LEFT COLUMN: Media (Images + Thumbnails) */}
                        <div
                            className="lg:w-1/2 bg-gray-50 p-6 lg:p-12 flex flex-col justify-center items-center relative cursor-pointer"
                            onClick={() => handleCardClick(activeDeal.id)}
                        >
                            {/* Main Image View */}
                            <div className="relative w-full aspect-square max-w-md mb-6 transition-all duration-500">
                                <div className="w-full h-full rounded-xl shadow-sm flex items-center justify-center overflow-hidden bg-white">
                                    {activeDeal.images?.[activeImageIndex] ? (
                                        <img
                                            src={activeDeal.images[activeImageIndex]}
                                            alt={activeDeal.name}
                                            className="w-full h-full object-contain"
                                        />
                                    ) : (
                                        <span className="text-gray-400">No Image</span>
                                    )}
                                </div>

                                {/* Discount Badge */}
                                {activeDeal.originalPrice && activeDeal.originalPrice > activeDeal.price && (
                                    <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
                                        SAVE {Math.round(((activeDeal.originalPrice - activeDeal.price) / activeDeal.originalPrice) * 100)}%
                                    </div>
                                )}
                            </div>

                            {/* Thumbnail Selector */}
                            {activeDeal.images && activeDeal.images.length > 1 && (
                                <div className="flex gap-4">
                                    {activeDeal.images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveImageIndex(idx);
                                            }}
                                            className={`w-16 h-16 rounded-lg border-2 flex items-center justify-center overflow-hidden transition-all bg-white ${activeImageIndex === idx ? 'border-blue-600 ring-2 ring-blue-100' : 'border-gray-300 hover:border-gray-400'
                                                }`}
                                        >
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* RIGHT COLUMN: Product Details */}
                        <div
                            className="lg:w-1/2 p-6 lg:p-12 flex flex-col justify-center bg-white cursor-pointer group"
                            onClick={() => handleCardClick(activeDeal.id)}
                        >
                            <div className="max-w-xl group-hover:opacity-90 transition-opacity">
                                <span className="text-sm font-medium text-blue-600 uppercase tracking-wide">
                                    {activeDeal.category}
                                </span>

                                <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-2 mb-2 leading-tight">
                                    {activeDeal.name}
                                </h3>

                                {/* Price Block */}
                                <div className="flex items-center gap-4 mb-4">
                                    <span className="text-3xl font-bold text-gray-900">₹{activeDeal.price.toLocaleString()}</span>
                                    {activeDeal.originalPrice && (
                                        <span className="text-xl text-gray-400 line-through decoration-gray-300">₹{activeDeal.originalPrice.toLocaleString()}</span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mb-6 font-medium">
                                    Tax included · Shipping calculated at checkout
                                </p>

                                <div className="prose prose-sm text-gray-600 mb-8 line-clamp-3">
                                    <p>{activeDeal.description}</p>
                                </div>

                                {/* Controls: Quantity & Buttons */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <label className="text-sm font-medium text-gray-700">Quantity:</label>
                                        <div className="flex items-center border border-gray-300 rounded-lg" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleQuantityChange(-1); }}
                                                className="p-3 text-gray-600 hover:text-blue-600 transition-colors"
                                            >
                                                <FiMinus className="w-4 h-4" />
                                            </button>
                                            <span className="w-12 text-center font-bold text-gray-900">{quantity}</span>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleQuantityChange(1); }}
                                                className="p-3 text-gray-600 hover:text-blue-600 transition-colors"
                                            >
                                                <FiPlus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <button
                                            onClick={handleAddToCart}
                                            className="flex-1 bg-white border-2 border-blue-600 text-blue-600 py-3.5 px-6 rounded-xl font-bold hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                                        >
                                            <FiShoppingCart className="w-5 h-5" /> Add to Cart
                                        </button>
                                        <button
                                            onClick={handleBuyNow}
                                            className="flex-1 bg-blue-600 text-white py-3.5 px-6 rounded-xl font-bold hover:bg-blue-700 hover:shadow-lg transition-all"
                                        >
                                            Buy Now
                                        </button>
                                    </div>

                                    <div className="pt-8 border-t border-gray-100 grid grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <FiTruck className="w-5 h-5 text-blue-600" />
                                            <span>Fast Delivery</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <FiCheckCircle className="w-5 h-5 text-blue-600" />
                                            <span>Easy Returns</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <FiPackage className="w-5 h-5 text-blue-600" />
                                            <span>Secure Packaging</span>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}
