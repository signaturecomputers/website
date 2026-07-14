'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FiShoppingCart, FiChevronLeft, FiChevronRight, FiArrowRight } from 'react-icons/fi';
import { HiOutlineFire } from 'react-icons/hi';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getProductById, Product } from '@/lib/products';

interface HeroImageData {
    imageUrl: string;
    alt: string;
}

export default function Hero() {
    const router = useRouter();

    // Hero image state
    const [heroImage, setHeroImage] = useState<HeroImageData>({
        imageUrl: '/hero-image-v2.png',
        alt: 'Signature Computers Hero'
    });

    // EDM images state
    const [edmImages, setEdmImages] = useState<HeroImageData[]>([]);

    // Hot Deals carousel state
    const [hotDeals, setHotDeals] = useState<Product[]>([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [loading, setLoading] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const slideRef = useRef<HTMLDivElement>(null);

    // Fetch hero image
    useEffect(() => {
        async function fetchHeroImage() {
            try {
                const heroDoc = await getDoc(doc(db, 'header_settings', 'hero_image'));
                if (heroDoc.exists()) {
                    const data = heroDoc.data() as HeroImageData;
                    if (data.imageUrl) {
                        setHeroImage(data);
                    }
                }
            } catch (error) {
                console.warn('Failed to fetch hero image, using default:', error);
            }
        }
        fetchHeroImage();
    }, []);

    // Fetch edm images
    useEffect(() => {
        async function fetchEdmImages() {
            try {
                const edmDoc = await getDoc(doc(db, 'header_settings', 'edm_images'));
                if (edmDoc.exists()) {
                    const data = edmDoc.data();
                    if (data.images) {
                        setEdmImages(data.images);
                    }
                } else {
                    // Check old edm_image for backward compatibility
                    const oldEdmDoc = await getDoc(doc(db, 'header_settings', 'edm_image'));
                    if (oldEdmDoc.exists()) {
                        const data = oldEdmDoc.data() as HeroImageData;
                        if (data.imageUrl) {
                            setEdmImages([data]);
                        }
                    }
                }
            } catch (error) {
                console.warn('Failed to fetch edm images:', error);
            }
        }
        fetchEdmImages();
    }, []);

    // Fetch Hot Deals products
    useEffect(() => {
        async function fetchHotDeals() {
            try {
                const hotDealsRef = collection(db, 'hot_deals');
                const snapshot = await getDocs(hotDealsRef);

                const dealProducts: Product[] = [];
                for (const docSnap of snapshot.docs) {
                    const dealData = docSnap.data();
                    const product = await getProductById(dealData.productId);
                    if (product) {
                        dealProducts.push(product);
                    }
                }

                setHotDeals(dealProducts);
            } catch (err) {
                console.error("Failed to fetch hot deals:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchHotDeals();
    }, []);

    // Total slides = 1 (static hero) + number of edm images + number of hot deals
    const edmCount = edmImages.length;
    const totalSlides = 1 + edmCount + hotDeals.length;

    // Navigation with fade transition
    const goToSlide = useCallback((index: number) => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrentSlide(index);
        setTimeout(() => setIsTransitioning(false), 600);
    }, [isTransitioning]);

    const nextSlide = useCallback(() => {
        if (totalSlides <= 1) return;
        goToSlide((currentSlide + 1) % totalSlides);
    }, [totalSlides, currentSlide, goToSlide]);

    const prevSlide = useCallback(() => {
        if (totalSlides <= 1) return;
        goToSlide((currentSlide - 1 + totalSlides) % totalSlides);
    }, [totalSlides, currentSlide, goToSlide]);

    // Auto-slide every 6 seconds
    useEffect(() => {
        if (!isAutoPlaying || totalSlides <= 1) return;
        const interval = setInterval(nextSlide, 6000);
        return () => clearInterval(interval);
    }, [nextSlide, isAutoPlaying, totalSlides]);

    // Pause auto-play on hover
    const handleMouseEnter = () => setIsAutoPlaying(false);
    const handleMouseLeave = () => setIsAutoPlaying(true);

    // Navigate to product page
    const handleProductClick = (productId: string) => {
        router.push(`/product/${productId}`);
    };

    // Touch & Mouse Drag/Swipe gesture states and handlers
    const [dragStartX, setDragStartX] = useState<number | null>(null);
    const [dragCurrentX, setDragCurrentX] = useState<number | null>(null);

    const handleTouchStart = (e: React.TouchEvent) => {
        setDragStartX(e.touches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (dragStartX === null) return;
        setDragCurrentX(e.touches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (dragStartX === null || dragCurrentX === null) return;
        const diff = dragStartX - dragCurrentX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
        setDragStartX(null);
        setDragCurrentX(null);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setDragStartX(e.clientX);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (dragStartX === null) return;
        setDragCurrentX(e.clientX);
    };

    const handleMouseUp = () => {
        if (dragStartX === null || dragCurrentX === null) return;
        const diff = dragStartX - dragCurrentX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
        setDragStartX(null);
        setDragCurrentX(null);
    };

    const handleMouseLeaveDrag = () => {
        setDragStartX(null);
        setDragCurrentX(null);
    };

    const hasHotDeals = !loading && hotDeals.length > 0;
    const showNavigation = totalSlides > 1;
    const isEdmActive = currentSlide > 0 && currentSlide <= edmCount;

    // Decorative shapes colors
    const decorColors = [
        { shape1: 'bg-blue-500', shape2: 'bg-cyan-400', shape3: 'bg-indigo-400' },
        { shape1: 'bg-purple-500', shape2: 'bg-pink-400', shape3: 'bg-violet-400' },
        { shape1: 'bg-emerald-500', shape2: 'bg-teal-400', shape3: 'bg-green-400' },
        { shape1: 'bg-orange-500', shape2: 'bg-amber-400', shape3: 'bg-yellow-400' },
        { shape1: 'bg-rose-500', shape2: 'bg-red-400', shape3: 'bg-pink-500' },
    ];

    return (
        <div
            className="relative overflow-hidden group/hero select-none"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={(e) => {
                handleMouseLeave();
                handleMouseLeaveDrag();
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        >
            {/* All Slides - Using fade transition */}
            <div
                ref={slideRef}
                className="relative transition-all duration-500 w-full min-h-[500px] lg:min-h-[550px] 3xl:min-h-[600px] 4xl:min-h-[680px] 5xl:min-h-[730px]"
            >

                {/* SLIDE 0: Static Hero Section */}
                <div
                    className={`absolute inset-0 w-full h-full bg-white transition-all duration-600 ease-in-out ${currentSlide === 0
                        ? 'opacity-100 z-10 pointer-events-auto'
                        : 'opacity-0 z-0 pointer-events-none'
                        }`}
                >
                    <div className="relative z-10 bg-white pb-12 pt-12 lg:pt-16 h-full">
                        <main className="w-full px-4 sm:px-8 lg:px-12 flex flex-col lg:flex-row items-center gap-10 lg:gap-0 h-full">
                            {/* LEFT: Text Content */}
                            <div className="flex-1 lg:flex-none lg:w-[50%] z-20 pl-0 lg:pl-6 self-center pr-8">
                                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wide text-blue-700 bg-blue-100 mb-4 uppercase">
                                    HP Authorized Distributor and Reseller
                                </span>
                                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl mb-6">
                                    Your Complete <br className="hidden lg:block" />
                                    <span className="text-blue-600">Computer Solutions</span>
                                </h1>
                                <p className="mt-2 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-2xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0 mb-8 font-light leading-relaxed">
                                    From laptops to workstations, memory & storage to accessories – we provide premium technology solutions for homes and businesses.
                                </p>
                                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start gap-4">
                                    <div className="rounded-md shadow">
                                        <Link href="/products" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition-all hover:shadow-lg">
                                            <FiShoppingCart className="mr-2" /> Shop Now
                                        </Link>
                                    </div>
                                    <div className="mt-3 sm:mt-0 sm:ml-3">
                                        <Link href="/get-quote" className="w-full flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition-colors">
                                            Get Quote
                                        </Link>
                                    </div>
                                </div>
                            </div>
                            {/* RIGHT: Hero Image */}
                            <div className="flex-1 lg:flex-none lg:w-[50%] w-full relative flex items-center justify-end mt-6 lg:mt-0">
                                <div className="relative w-full max-w-md lg:max-w-xl xl:max-w-none h-auto max-h-[350px] lg:max-h-[420px] xl:max-h-[460px] 2xl:max-h-[480px] ml-auto mr-0">
                                    <Image
                                        src={heroImage.imageUrl}
                                        alt={heroImage.alt}
                                        width={800}
                                        height={600}
                                        priority
                                        quality={100}
                                        unoptimized
                                        className="w-full h-auto max-h-[350px] lg:max-h-[420px] xl:max-h-[460px] 2xl:max-h-[480px] object-contain object-right"
                                    />
                                </div>
                            </div>
                        </main>
                    </div>
                </div>

                {/* EDM Images Slides (indices 1 to edmCount) */}
                {edmImages.map((edm, index) => {
                    const slideIndex = index + 1;
                    return (
                        <div
                            key={`edm-${index}`}
                            className={`absolute inset-0 w-full h-full bg-white transition-all duration-600 ease-in-out ${currentSlide === slideIndex
                                ? 'opacity-100 z-10 pointer-events-auto'
                                : 'opacity-0 z-0 pointer-events-none'
                                }`}
                        >
                            <div className="relative w-full h-full flex items-center justify-center">
                                <Image
                                    src={edm.imageUrl}
                                    alt={edm.alt || `EDM Offer ${index + 1}`}
                                    fill
                                    className="object-fill pointer-events-none"
                                    priority={index === 0}
                                    draggable={false}
                                />
                            </div>
                        </div>
                    );
                })}

                {/* SLIDES (1 + edmCount)+: Hot Deal Products with decorative shapes */}
                {hotDeals.map((deal, index) => {
                    const discount = deal.originalPrice && deal.originalPrice > deal.price
                        ? Math.round(((deal.originalPrice - deal.price) / deal.originalPrice) * 100)
                        : 0;
                    const colors = decorColors[index % decorColors.length];
                    const slideIndex = index + 1 + edmCount;

                    return (
                        <div
                            key={deal.id}
                            className={`absolute inset-0 w-full h-full bg-white transition-all duration-600 ease-in-out cursor-pointer ${currentSlide === slideIndex
                                ? 'opacity-100 z-10 pointer-events-auto'
                                : 'opacity-0 z-0 pointer-events-none'
                                }`}
                            onClick={() => handleProductClick(deal.id)}
                        >
                            {/* Decorative Shapes - Eye-catching colored elements */}
                            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                {/* Large circle - top right */}
                                <div className={`absolute -top-20 -right-20 w-96 h-96 ${colors.shape1} opacity-10 rounded-full blur-3xl`}></div>

                                {/* Medium circle - bottom left */}
                                <div className={`absolute -bottom-16 -left-16 w-72 h-72 ${colors.shape2} opacity-15 rounded-full blur-2xl`}></div>

                                {/* Small decorative blob - right side */}
                                <div className={`absolute top-1/3 right-10 w-32 h-32 ${colors.shape1} opacity-20 rounded-full blur-xl`}></div>

                                {/* Colored stripe/bar accent */}
                                <div className={`absolute top-0 left-0 w-2 h-full ${colors.shape1}`}></div>

                                {/* Floating circles decoration */}
                                <div className={`absolute top-20 left-1/4 w-4 h-4 ${colors.shape2} opacity-60 rounded-full`}></div>
                                <div className={`absolute top-32 left-1/3 w-2 h-2 ${colors.shape3} opacity-40 rounded-full`}></div>
                                <div className={`absolute bottom-32 right-1/4 w-3 h-3 ${colors.shape1} opacity-50 rounded-full`}></div>
                            </div>

                            <div className="relative z-10 w-full h-full px-4 sm:px-8 lg:px-16 py-12 lg:py-16 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">

                                {/* LEFT: Product Info */}
                                <div className="flex-1 lg:w-1/2 text-center lg:text-left">
                                    {/* Badges */}
                                    <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-6">
                                        <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold ${colors.shape1} text-white shadow-lg`}>
                                            <HiOutlineFire className="w-4 h-4" />
                                            HOT DEAL
                                        </span>
                                        {discount > 0 && (
                                            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold bg-green-500 text-white shadow-lg">
                                                {discount}% OFF
                                            </span>
                                        )}
                                    </div>

                                    {/* Category */}
                                    <p className={`uppercase tracking-widest text-xs font-semibold mb-3`} style={{ color: 'rgb(37, 99, 235)' }}>
                                        {deal.category}
                                    </p>

                                    {/* Product Name */}
                                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
                                        {deal.name}
                                    </h1>

                                    {/* Description */}
                                    <p className="text-gray-600 text-base lg:text-lg mb-6 line-clamp-2 max-w-xl mx-auto lg:mx-0">
                                        {deal.description}
                                    </p>

                                    {/* Price */}
                                    <div className="flex items-center justify-center lg:justify-start gap-4 mb-8">
                                        <span className="text-4xl lg:text-5xl font-black text-gray-900">
                                            ₹{deal.price.toLocaleString('en-IN')}
                                        </span>
                                        {deal.originalPrice && deal.originalPrice > deal.price && (
                                            <span className="text-xl text-gray-400 line-through">
                                                ₹{deal.originalPrice.toLocaleString('en-IN')}
                                            </span>
                                        )}
                                    </div>

                                    {/* CTA Button */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleProductClick(deal.id); }}
                                        className={`inline-flex items-center gap-2 px-8 py-4 ${colors.shape1} text-white rounded-lg font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300`}
                                    >
                                        View Deal
                                        <FiArrowRight className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* RIGHT: Product Image with colored background shape */}
                                <div className="flex-1 lg:w-1/2 flex items-center justify-center relative">
                                    {/* Colored shape behind product */}
                                    <div className={`absolute w-80 h-80 ${colors.shape1} opacity-10 rounded-3xl rotate-12 transform`}></div>
                                    <div className={`absolute w-72 h-72 ${colors.shape2} opacity-15 rounded-full -translate-x-4 translate-y-4`}></div>

                                    {/* Product Image */}
                                    <div className="relative z-10 w-full max-w-md lg:max-w-lg">
                                        {deal.images?.[0] ? (
                                            <img
                                                src={deal.images[0]}
                                                alt={deal.name}
                                                className="w-full h-auto object-contain drop-shadow-2xl hover:scale-[1.02] transition-transform duration-500"
                                                style={{ maxHeight: '400px' }}
                                            />
                                        ) : (
                                            <div className="w-full h-64 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                                                No Image
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Navigation Arrows - Subtle, only on hover */}
            {showNavigation && (
                <>
                    <button
                        onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                        className="absolute left-2 lg:left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/90 border border-gray-200 shadow-md hover:bg-white hover:shadow-lg transition-all text-gray-500 hover:text-blue-600 opacity-0 group-hover/hero:opacity-100"
                        aria-label="Previous slide"
                    >
                        <FiChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                        className="absolute right-2 lg:right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/90 border border-gray-200 shadow-md hover:bg-white hover:shadow-lg transition-all text-gray-500 hover:text-blue-600 opacity-0 group-hover/hero:opacity-100"
                        aria-label="Next slide"
                    >
                        <FiChevronRight className="w-5 h-5" />
                    </button>
                </>
            )}

            {/* Dot Indicators */}
            {showNavigation && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                    {Array.from({ length: totalSlides }).map((_, index) => (
                        <button
                            key={index}
                            onClick={(e) => { e.stopPropagation(); goToSlide(index); }}
                            className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide
                                ? 'bg-blue-600 w-6'
                                : 'bg-gray-300 w-2 hover:bg-gray-400'
                                }`}
                            aria-label={index === 0 ? 'Go to Home' : `Go to deal ${index}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
