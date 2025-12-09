'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiShoppingCart, FiCheckCircle, FiPackage, FiTruck, FiChevronLeft, FiChevronRight, FiMinus, FiPlus } from 'react-icons/fi';
import { useCart } from '@/context/CartContext';

// Mock Data for Hot Deals (PDP Style)
export const HOT_DEALS_DATA = [
    {
        id: 101,
        name: 'HP OMEN Gaming Laptop 16',
        category: 'laptops',
        price: 1299.99,
        originalPrice: 1499.00,
        description: 'Experience desktop-level performance with the HP OMEN 16. Powered by NVIDIA GeForce RTX 4060 and Intel Core i7 for ultimate gaming.',
        images: [
            '/products/laptop-1.png',
            '/products/laptop-2.png',
            '/products/laptop-3.png',
        ],
        mockColors: ['bg-gray-900', 'bg-gray-800', 'bg-black'],
    },
    {
        id: 102,
        name: 'HP LaserJet Pro MFP',
        category: 'printers',
        price: 299.99,
        originalPrice: 350.00,
        description: 'Efficient, wireless multifunction printer for your business. Print, scan, and copy with high-speed performance and security.',
        images: [
            '/products/printer-1.png',
            '/products/printer-2.png',
        ],
        mockColors: ['bg-gray-200', 'bg-white'],
    },
    {
        id: 103,
        name: 'HP Z2 Mini G9 Workstation',
        category: 'workstations',
        price: 999.00,
        originalPrice: 1250.00,
        description: 'Incredibly powerful, insanely small. The Z2 Mini G9 packs workstation performance into a design that fits on any desk.',
        images: [
            '/products/workstation-1.png',
            '/products/workstation-2.png',
            '/products/workstation-3.png',
        ],
        mockColors: ['bg-gray-700', 'bg-gray-600', 'bg-gray-800'],
    },
];

interface HotDealsProps {
    mode?: 'home' | 'page';
}

export default function HotDealsSection({ mode = 'home' }: HotDealsProps) {
    const router = useRouter();
    const { addToCart } = useCart();

    const handleCardClick = (category: string, id: number) => {
        router.push(`/products/${category}/${id}`);
    };

    // State
    const [currentSlide, setCurrentSlide] = useState(0);
    const [activeImageIndex, setActiveImageIndex] = useState(0); // For thumbnail switching
    const [quantity, setQuantity] = useState(1);
    const [isAutoPlaying, setIsAutoPlaying] = useState(mode === 'home');

    const activeDeal = HOT_DEALS_DATA[currentSlide];

    // Reset internal state when slide changes
    useEffect(() => {
        setActiveImageIndex(0);
        setQuantity(1);
    }, [currentSlide]);

    // Navigation
    const nextSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev + 1) % HOT_DEALS_DATA.length);
    }, []);

    const prevSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev - 1 + HOT_DEALS_DATA.length) % HOT_DEALS_DATA.length);
    }, []);

    // Auto-slide
    useEffect(() => {
        if (!isAutoPlaying) return;
        const interval = setInterval(nextSlide, 5000);
        return () => clearInterval(interval);
    }, [nextSlide, isAutoPlaying]);

    // Handlers
    const handleQuantityChange = (delta: number) => {
        setQuantity(prev => Math.max(1, prev + delta));
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        addToCart({
            id: activeDeal.id.toString(),
            name: activeDeal.name,
            price: activeDeal.price,
            image: activeDeal.images[0], // Simplified mock image
            quantity: quantity
        });
        // Optional: Toast notification here
    };

    const handleBuyNow = (e: React.MouseEvent) => {
        e.stopPropagation();
        handleAddToCart(e);
        router.push('/cart');
    };

    // Pause auto-play on hover
    const handleMouseEnter = () => { if (mode === 'home') setIsAutoPlaying(false); };
    const handleMouseLeave = () => { if (mode === 'home') setIsAutoPlaying(true); };

    return (
        <section
            id="hot-deals"
            className="py-16 bg-white overflow-hidden" // Matches Hero/About bg
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">

                {/* Heading */}
                {/* Heading */}
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        {mode === 'page' ? 'Exclusive Hot Deals' : 'Hot Deals'}
                    </h2>
                    <div className="w-16 h-1 bg-blue-600 mx-auto rounded-full mt-2"></div>

                    {mode === 'page' && (
                        <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-5xl mx-auto hidden sm:block">
                            Grab the best prices on high-performance hardware. Limited stock available for these hand-picked periodic offers.
                        </p>
                    )}
                    {mode === 'page' && (
                        <p className="mt-4 text-base text-gray-600 max-w-xl mx-auto sm:hidden">
                            Grab the best prices on high-performance hardware. Limited stock available.
                        </p>
                    )}
                </div>

                {/* Main Content Area - Full Width Slider */}
                <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden min-h-[500px]">

                    {/* Navigation Arrows */}
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

                    {/* Content Grid */}
                    <div className="flex flex-col lg:flex-row h-full">

                        {/* LEFT COLUMN: Media (Images + Thumbnails) */}
                        <div
                            className="lg:w-1/2 bg-gray-50 p-6 lg:p-12 flex flex-col justify-center items-center relative cursor-pointer"
                            onClick={() => handleCardClick(activeDeal.category, activeDeal.id)}
                        >
                            {/* Main Image View */}
                            <div className="relative w-full aspect-square max-w-md mb-6 transition-all duration-500">
                                {/* Using divs to simulate images if real assets missing, in real app use Next Image */}
                                <div className={`w-full h-full rounded-xl shadow-sm flex items-center justify-center text-4xl font-bold text-white/20 select-none ${activeDeal.mockColors[activeImageIndex] || 'bg-gray-800'}`}>
                                    {activeDeal.category.toUpperCase()}
                                    <br />
                                    <span className="text-lg font-medium opacity-50 mt-2">View {activeImageIndex + 1}</span>
                                </div>

                                {/* Discount Badge */}
                                <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
                                    SAVE {Math.round(((activeDeal.originalPrice - activeDeal.price) / activeDeal.originalPrice) * 100)}%
                                </div>
                            </div>

                            {/* Thumbnail Selector */}
                            <div className="flex gap-4">
                                {activeDeal.images.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveImageIndex(idx);
                                        }}
                                        className={`w-16 h-16 rounded-lg border-2 flex items-center justify-center overflow-hidden transition-all ${activeImageIndex === idx ? 'border-blue-600 ring-2 ring-blue-100' : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                    >
                                        <div className={`w-full h-full ${activeDeal.mockColors[idx] || 'bg-gray-200'}`}></div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Product Details */}
                        <div
                            className="lg:w-1/2 p-6 lg:p-12 flex flex-col justify-center bg-white cursor-pointer group"
                            onClick={() => handleCardClick(activeDeal.category, activeDeal.id)}
                        >
                            <div className="max-w-xl group-hover:opacity-90 transition-opacity">
                                <Link href={`/products/${activeDeal.category}`} onClick={(e) => e.stopPropagation()}>
                                    <span className="text-sm font-medium text-blue-600 hover:underline uppercase tracking-wide cursor-pointer">
                                        Back to {activeDeal.category}
                                    </span>
                                </Link>

                                <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-2 mb-2 leading-tight">
                                    {activeDeal.name}
                                </h3>

                                {/* Price Block */}
                                <div className="flex items-center gap-4 mb-4">
                                    <span className="text-3xl font-bold text-gray-900">${activeDeal.price.toLocaleString()}</span>
                                    <span className="text-xl text-gray-400 line-through decoration-gray-300">${activeDeal.originalPrice.toLocaleString()}</span>
                                </div>
                                <p className="text-xs text-gray-500 mb-6 font-medium">
                                    Tax included · Shipping calculated at checkout
                                </p>

                                <div className="prose prose-sm text-gray-600 mb-8">
                                    <p>{activeDeal.description}</p>
                                </div>

                                {/* Controls: Quantity & Buttons */}
                                <div className="space-y-6">
                                    {/* Quantity */}
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

                                    {/* Action Buttons */}
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

                                    {/* Trust Badges */}
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

                {/* WEEKLY DEALS GRID (Only in 'page' mode) */}
                {mode === 'page' && (
                    <div className="mt-16">
                        <div className="text-left mb-8">
                            <h3 className="text-2xl font-bold tracking-tight text-gray-900">Hot Deals This Week</h3>
                            <p className="text-gray-600 mt-2 whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
                                Limited-time offers updated regularly — grab the best deals before they’re gone.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {HOT_DEALS_DATA.map((deal, idx) => (
                                <div
                                    key={deal.id}
                                    onClick={() => {
                                        setCurrentSlide(idx);
                                        window.scrollTo({ top: 0, behavior: 'smooth' }); // Optional: Scroll to top to see selection
                                    }}
                                    className={`bg-white rounded-xl shadow-sm border p-4 cursor-pointer transition-all hover:shadow-md ${currentSlide === idx ? 'border-blue-600 ring-1 ring-blue-600' : 'border-gray-200 hover:border-blue-300'}`}
                                >
                                    <div className={`aspect-video rounded-lg w-full mb-4 flex items-center justify-center text-white font-bold text-xl ${deal.mockColors[0] || 'bg-gray-800'}`}>
                                        {deal.category.toUpperCase()}
                                    </div>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-gray-900 line-clamp-1">{deal.name}</h4>
                                            <div className="flex gap-2 items-center mt-1">
                                                <span className="font-bold text-blue-600">${deal.price.toLocaleString()}</span>
                                                <span className="text-sm text-gray-400 line-through">${deal.originalPrice.toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded">
                                            -{Math.round(((deal.originalPrice - deal.price) / deal.originalPrice) * 100)}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
