'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FiStar, FiShoppingCart, FiHeart, FiCreditCard, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { getProductById, getRelatedProducts, getSuggestedAccessories, Product } from '@/lib/products';
import { toast } from 'sonner';
import ProductInfoSection from '@/components/ProductInfoSection';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { isFreeDOSProduct, getWindowsInstallationPrice } from '@/lib/windowsInstallationConfig';
import ProductSchema from '@/components/seo/ProductSchema';
import ProductSEOContent from '@/components/ProductSEOContent';

interface ProductDetailsProps {
    id: string;
}

export default function ProductDetails({ id }: ProductDetailsProps) {
    const router = useRouter();

    const { adminUser } = useAdminAuth();
    const isAdmin = !!adminUser;
    const { user } = useAuth();
    const { addToCart, saveForLater, isInSaved } = useCart();

    const [product, setProduct] = useState<Product | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [suggestedAccessories, setSuggestedAccessories] = useState<{ category: string; categoryName: string; products: Product[] }[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('description');
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState('');
    const [isSaved, setIsSaved] = useState(false);

    // Windows installation state
    const [isFreeDOS, setIsFreeDOS] = useState(false);
    const [windowsInstallation, setWindowsInstallation] = useState(false);
    const [windowsPrice, setWindowsPrice] = useState(5000);
    const [showWindowsModal, setShowWindowsModal] = useState(false);
    const [modalDismissed, setModalDismissed] = useState(false);

    // Thumbnail scroll state
    const [canScrollUp, setCanScrollUp] = useState(false);
    const [canScrollDown, setCanScrollDown] = useState(false);
    const [maxThumbnailHeight, setMaxThumbnailHeight] = useState<number | undefined>(undefined);
    
    const thumbnailContainerRef = useRef<HTMLDivElement>(null);
    const mainImageContainerRef = useRef<HTMLDivElement>(null);

    const checkScroll = () => {
        const container = thumbnailContainerRef.current;
        if (container) {
            const { scrollTop, scrollHeight, clientHeight } = container;
            setCanScrollUp(scrollTop > 1);
            setCanScrollDown(scrollTop + clientHeight < scrollHeight - 1);
        }
    };

    const scrollThumbnails = (direction: 'up' | 'down') => {
        const container = thumbnailContainerRef.current;
        if (container) {
            const scrollAmount = container.clientHeight * 0.6;
            container.scrollBy({
                top: direction === 'up' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const updateMaxHeight = () => {
        const container = mainImageContainerRef.current;
        if (container) {
            setMaxThumbnailHeight(container.clientHeight);
        }
    };

    // Keep thumbnail scroll check updated
    useEffect(() => {
        const container = thumbnailContainerRef.current;
        if (!container) return;

        const observer = new ResizeObserver(() => {
            checkScroll();
        });
        observer.observe(container);
        
        container.addEventListener('scroll', checkScroll);
        
        const timer = setTimeout(checkScroll, 100);

        return () => {
            observer.disconnect();
            container.removeEventListener('scroll', checkScroll);
            clearTimeout(timer);
        };
    }, [product, product?.images, maxThumbnailHeight]);

    // Update thumbnail max-height based on main image height
    useEffect(() => {
        const container = mainImageContainerRef.current;
        if (!container) return;

        const observer = new ResizeObserver(() => {
            updateMaxHeight();
        });
        observer.observe(container);
        
        updateMaxHeight();
        
        const timer = setTimeout(updateMaxHeight, 100);

        return () => {
            observer.disconnect();
            clearTimeout(timer);
        };
    }, [product, activeImage]);

    const handleBuyNow = () => {
        if (!user) {
            toast.error('Please login to checkout');
            router.push('/login');
            return;
        }

        // Show modal if Free DOS product, no Windows selected, and modal not dismissed yet
        if (isFreeDOS && !windowsInstallation && !modalDismissed) {
            setShowWindowsModal(true);
            return;
        }

        // Proceed with adding to cart
        if (product) {
            addToCart({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.images?.[0] || '',
                quantity: quantity,
                windowsInstallation: windowsInstallation,
                windowsInstallationPrice: windowsInstallation ? windowsPrice : undefined,
            });
            router.push('/checkout');
        }
    };

    const handleAddToCart = () => {
        // Show modal if Free DOS product, no Windows selected, and modal not dismissed yet
        if (isFreeDOS && !windowsInstallation && !modalDismissed) {
            setShowWindowsModal(true);
            return;
        }

        // Proceed with adding to cart
        if (product) {
            addToCart({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.images?.[0] || '',
                quantity: quantity,
                windowsInstallation: windowsInstallation,
                windowsInstallationPrice: windowsInstallation ? windowsPrice : undefined,
            });
            toast.success('Added to cart!', {
                description: `${product.productInfo?.title || product.name} (Qty: ${quantity})${windowsInstallation ? ' + Windows 11 Pro' : ''}`,
                duration: 3000,
            });
        }
    };

    const handleSaveForLater = () => {
        if (product) {
            const success = saveForLater({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.images?.[0] || '',
            });
            if (success) {
                setIsSaved(true);
                toast.success('Saved for later!', {
                    description: 'View in your cart under "Saved Items"',
                    duration: 3000,
                });
            }
        }
    };

    const scrollToSpecs = () => {
        setActiveTab('description');
        const specsSection = document.getElementById('product-tabs');
        if (specsSection) {
            const offset = 80; // Offset for navbar
            const elementPosition = specsSection.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    // Preferred spec order for display
    const SPEC_ORDER = ['Processor', 'Operating System', 'Display Size', 'Graphics', 'RAM', 'Storage'];

    const getKeySpecs = () => {
        if (!product?.specs) return [];
        // Return specs in preferred order
        const orderedSpecs: [string, string][] = [];
        SPEC_ORDER.forEach(key => {
            if (product.specs && product.specs[key]) {
                orderedSpecs.push([key, product.specs[key]]);
            }
        });
        return orderedSpecs.slice(0, 5);
    };

    useEffect(() => {
        async function loadProduct() {
            setLoading(true);
            const data = await getProductById(id);
            if (data) {
                setProduct(data);
                setActiveImage(data.images?.[0] || '');

                // Check if product is Free DOS
                const isFreeDOSValue = isFreeDOSProduct(data);
                setIsFreeDOS(isFreeDOSValue);

                // Fetch Windows installation price if Free DOS
                if (isFreeDOSValue) {
                    const price = await getWindowsInstallationPrice();
                    setWindowsPrice(price);
                }

                // Fetch related products from same category
                const related = await getRelatedProducts(data.category, data.id, 4);
                setRelatedProducts(related);

                // Fetch suggested accessories
                const accessories = await getSuggestedAccessories(data.category);
                setSuggestedAccessories(accessories);
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
            // Update page title for SEO
            document.title = `${product.productInfo?.title || product.name} | Signature Computers`;
        }
        // Reset title on unmount
        return () => {
            document.title = 'Signature Computers | Premium Tech Store';
        };
    }, [product, isInSaved]);

    // Handler to add to cart from modal
    const handleAddFromModal = (includeWindows: boolean) => {
        setShowWindowsModal(false);
        setModalDismissed(true);

        if (includeWindows) {
            setWindowsInstallation(true);
        }

        // Add to cart
        if (product) {
            addToCart({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.images?.[0] || '',
                quantity: quantity,
                windowsInstallation: includeWindows,
                windowsInstallationPrice: includeWindows ? windowsPrice : undefined,
            });

            // Show success toast
            toast.success('Added to cart!', {
                description: `${product.productInfo?.title || product.name} (Qty: ${quantity})${includeWindows ? ' + Windows 11 Pro' : ''}`,
                duration: 3000,
            });
        }
    };

    // Handler to close modal without adding
    const handleCloseModal = () => {
        setShowWindowsModal(false);
        setModalDismissed(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-black">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500">Loading product...</p>
            </div>
        );
    }

    if (!product) {
        return <div className="min-h-screen flex items-center justify-center">Product not found.</div>;
    }

    const keySpecs = getKeySpecs();
    const hasMultipleImages = product.images && product.images.length > 1;

    return (
        <div className="bg-white dark:bg-black min-h-screen py-12">
            {/* SEO: Product JSON-LD Schema */}
            <ProductSchema product={product} />
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                {/* Main Layout with thumbnails at left */}
                <div className="flex gap-4 lg:gap-6">
                    {/* Thumbnails at left - visible on larger screens, properly contained with vertical scroll */}
                    {hasMultipleImages && (
                        <div 
                            className="hidden lg:block w-16 xl:w-20 flex-shrink-0 relative"
                            style={{ height: maxThumbnailHeight ? `${maxThumbnailHeight}px` : 'auto' }}
                        >
                            <div className="absolute inset-y-0 left-0 right-0 flex flex-col">
                                {/* Scroll Up Button */}
                                {canScrollUp && (
                                    <button
                                        onClick={() => scrollThumbnails('up')}
                                        className="absolute top-0 left-0 right-0 z-10 flex items-center justify-center py-1 bg-gradient-to-b from-white via-white/90 to-transparent dark:from-black dark:via-black/90 dark:to-transparent text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                                        style={{ height: '24px' }}
                                    >
                                        <FiChevronUp size={18} />
                                    </button>
                                )}

                                {/* Scrollable Container */}
                                <div
                                    ref={thumbnailContainerRef}
                                    className="w-full h-full overflow-y-auto no-scrollbar scroll-smooth flex flex-col gap-3 py-6"
                                    onScroll={checkScroll}
                                >
                                    {product.images!.map((img, i) => (
                                        <div
                                            key={i}
                                            onClick={() => setActiveImage(img)}
                                            className={`w-16 h-16 xl:w-20 xl:h-20 bg-gray-100 dark:bg-gray-900 rounded-lg cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all flex items-center justify-center overflow-hidden flex-shrink-0 ${
                                                activeImage === img ? 'ring-2 ring-blue-500' : 'border border-gray-200 dark:border-gray-700'
                                            }`}
                                        >
                                            <img src={img} alt={`${product.productInfo?.title || product.name} product image`} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>

                                {/* Scroll Down Button */}
                                {canScrollDown && (
                                    <button
                                        onClick={() => scrollThumbnails('down')}
                                        className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center py-1 bg-gradient-to-t from-white via-white/90 to-transparent dark:from-black dark:via-black/90 dark:to-transparent text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                                        style={{ height: '24px' }}
                                    >
                                        <FiChevronDown size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Main content grid - Image and Info */}
                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-[1.2fr_1fr] gap-6 lg:gap-8">
                        {/* Main Image - Scales to fit container */}
                        <div ref={mainImageContainerRef} className="aspect-[4/3] overflow-hidden flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg">
                            {activeImage ? (
                                <img src={activeImage} alt={`${product.productInfo?.title || product.name} product image`} className="max-w-full max-h-full object-contain" />
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
                                            <img src={img} alt={`${product.productInfo?.title || product.name} product image`} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            )}

                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                {product.productInfo?.partNo && (
                                    <span className="sr-only">{product.productInfo.partNo} - </span>
                                )}
                                {product.productInfo?.title || product.name}
                            </h1>
                            {/* SEO: Hidden semantic content for search engines */}
                            <span className="sr-only">
                                Buy {product.brand} {product.productInfo?.partNo || ''} {product.productInfo?.title || product.name} in Chennai, Tamil Nadu, India.
                                Authorized dealer. Genuine {product.productInfo?.warranty?.duration || '1 Year'} warranty.
                                GST invoice available. Best price at Signature Computers.
                            </span>

                            <div className="flex items-center mb-4">
                                <div className="flex text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                        <FiStar key={i} className={i < 4 ? "fill-current" : ""} />
                                    ))}
                                </div>
                            </div>

                            {product.stock > 0 ? (
                                <div className="flex items-end gap-4 mb-4">
                                    <span className="text-4xl font-bold text-gray-900 dark:text-white">₹{product.price.toLocaleString('en-IN')}</span>
                                    {product.originalPrice && (
                                        <span className="text-xl text-gray-500 line-through mb-1">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                                    )}
                                </div>
                            ) : (
                                <div className="mb-4">
                                    <span className="text-2xl font-bold text-red-600 dark:text-red-400">Currently Unavailable</span>
                                </div>
                            )}

                            {/* Key Specifications Preview with bullet points */}
                            {keySpecs.length > 0 && (
                                <div className="border-t border-gray-100 dark:border-gray-800 pt-4 mb-4">
                                    <ul className="space-y-1.5 list-disc list-inside">
                                        {keySpecs.map(([key, value]) => (
                                            <li key={key} className="text-sm text-gray-600 dark:text-gray-400">
                                                {value}
                                            </li>
                                        ))}
                                    </ul>
                                    <button
                                        onClick={scrollToSpecs}
                                        className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
                                    >
                                        See more specifications
                                        <FiChevronDown size={14} />
                                    </button>
                                </div>
                            )}

                            {/* Windows Installation Option for Free DOS Products */}
                            {isFreeDOS && product.stock > 0 && (
                                <div className="border-t border-gray-100 dark:border-gray-800 pt-4 mb-4">
                                    <div
                                        onClick={() => setWindowsInstallation(!windowsInstallation)}
                                        className={`cursor-pointer transition-all duration-200 rounded-xl p-4 ${windowsInstallation
                                            ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
                                            : 'bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${windowsInstallation
                                                ? 'border-blue-600 bg-blue-600'
                                                : 'border-gray-300 dark:border-gray-600'
                                                }`}>
                                                {windowsInstallation && (
                                                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                                        <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M0,0V11.111H11.111V0ZM11.111,11.111V24H24V11.111ZM0,11.111V24H11.111V11.111ZM11.111,0V11.111H24V0Z" />
                                                        </svg>
                                                        Windows 11 Pro OEM Installation Available
                                                    </h4>
                                                    <span className="text-xl font-bold text-blue-600">+₹{windowsPrice.toLocaleString('en-IN')}</span>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                                    This product comes with Free DOS. Check this option to have <strong>Windows 11 Pro</strong> pre-installed by our expert team with a genuine OEM key included.
                                                </p>
                                                {windowsInstallation && (
                                                    <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        Windows 11 Pro OEM added - ₹{windowsPrice.toLocaleString('en-IN')} will be added to your total
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="border-t border-gray-100 dark:border-gray-800 pt-4 mb-4">
                                {product.stock <= 0 ? (
                                    <p className="text-sm font-medium text-red-600">Currently Unavailable</p>
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
                            {product.stock > 0 ? (
                                <div className="flex items-center gap-3 flex-wrap">
                                    <button
                                        onClick={handleAddToCart}
                                        className="flex-1 min-w-[140px] bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md flex items-center justify-center transition-colors"
                                    >
                                        <FiShoppingCart className="mr-2" /> Add to Cart
                                    </button>

                                    <button
                                        onClick={handleBuyNow}
                                        className="flex-1 min-w-[140px] bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-md flex items-center justify-center transition-colors"
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
                            ) : (
                                <div className="flex items-center gap-3 flex-wrap">
                                    <button
                                        disabled
                                        className="flex-1 min-w-[140px] bg-gray-300 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-bold py-3 px-6 rounded-md flex items-center justify-center cursor-not-allowed"
                                    >
                                        Currently Unavailable
                                    </button>
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
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div id="product-tabs" className="mt-16">
                    <div className="border-b border-gray-200 dark:border-gray-800">
                        <nav className="-mb-px flex space-x-8">
                            {['description', 'product info'].map((tab) => (
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
                            <div className="space-y-8">
                                {/* Description Section */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Description</h3>
                                    <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap mb-10">
                                        <p>{product.description}</p>
                                    </div>
                                    <ProductSEOContent 
                                        name={product.productInfo?.title || product.name || ''}
                                        brand={product.brand || 'Signature Computers'}
                                        model={product.productInfo?.partNo || 'Premium Model'}
                                        category={product.category}
                                        specs={{
                                            processor: product.specs?.['Processor'] || product.productInfo?.processor?.name,
                                            ram: product.specs?.['RAM'] || product.productInfo?.memory?.capacity,
                                            storage: product.specs?.['Storage'] || product.productInfo?.storage?.primaryStorage?.capacity,
                                            display: product.specs?.['Display Size'] || product.productInfo?.display?.size,
                                            warranty: product.productInfo?.warranty?.duration,
                                            condition: 'New'
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                        {activeTab === 'product info' && (
                            <ProductInfoSection productInfo={product.productInfo} isAdmin={isAdmin} />
                        )}
                    </div>
                </div>

                {/* Suggested Accessories Section */}
                {suggestedAccessories.length > 0 && (
                    <div className="mt-16 border-t border-gray-200 dark:border-gray-800 pt-12">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Suggested Accessories</h2>
                        <div className="space-y-8">
                            {suggestedAccessories.map((group) => (
                                <div key={group.category}>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{group.categoryName}</h3>
                                        <button
                                            onClick={() => router.push(`/products/${group.category}`)}
                                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            See more options →
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {group.products.map((accessory) => (
                                            <div
                                                key={accessory.id}
                                                onClick={() => router.push(`/product/${accessory.id}`)}
                                                className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            >
                                                <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center p-2 flex-shrink-0">
                                                    <img
                                                        src={accessory.images?.[0] || accessory.image}
                                                        alt={accessory.name}
                                                        className="max-w-full max-h-full object-contain"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                        {accessory.name}
                                                    </h4>
                                                    <p className="text-sm font-bold text-blue-600">
                                                        ₹{accessory.price.toLocaleString('en-IN')}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {/* Explore More Products Link */}
                <div className="mt-12 text-center text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
                    <p className="mb-2">
                        Looking for more options? Explore related categories and find exactly what you need.
                    </p>
                    <p>
                        Explore more products in our{' '}
                        <a href={`/category/${product.category}`} className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                            {product.category.charAt(0).toUpperCase() + product.category.slice(1)} Collection
                        </a>{' '}
                        or check out{' '}
                        <a href="/category/accessories" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                            Accessories
                        </a>{' '}
                        for additional options.
                    </p>
                </div>

                {/* Related Products Section */}
                {relatedProducts.length > 0 && (
                    <div className="mt-8 pb-12">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Related Products</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {relatedProducts.map((relatedProduct) => (
                                <div
                                    key={relatedProduct.id}
                                    onClick={() => router.push(`/product/${relatedProduct.id}`)}
                                    className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group"
                                >
                                    <div className="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center p-4">
                                        <img
                                            src={relatedProduct.images?.[0] || relatedProduct.image}
                                            alt={relatedProduct.name}
                                            className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 mb-2">
                                            {relatedProduct.name}
                                        </h3>
                                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                                            ₹{relatedProduct.price.toLocaleString('en-IN')}
                                        </p>
                                        {relatedProduct.originalPrice && (
                                            <p className="text-sm text-gray-500 line-through">
                                                ₹{relatedProduct.originalPrice.toLocaleString('en-IN')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Windows Installation Modal */}
            {showWindowsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        {/* Close Button */}
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            aria-label="Close"
                        >
                            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Warning Icon */}
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                <svg className="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-3">
                            No OS Pre-installed
                        </h3>

                        {/* Description */}
                        <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                            This product comes with <strong className="text-gray-900 dark:text-white">Free DOS</strong>.
                            Would you like to add <strong className="text-blue-600">Windows 11 Pro OEM</strong> installation for <strong className="text-blue-600">₹{windowsPrice.toLocaleString('en-IN')}</strong>?
                        </p>

                        {/* Windows Option Box */}
                        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl">
                            <div className="flex items-start gap-3">
                                <svg className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M0,0V11.111H11.111V0ZM11.111,11.111V24H24V11.111ZM0,11.111V24H11.111V11.111ZM11.111,0V11.111H24V0Z" />
                                </svg>
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-900 dark:text-white mb-1">Windows 11 Pro OEM Key & Installation</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Pre-installed by our expert team with genuine OEM key included
                                    </p>
                                </div>
                                <span className="text-xl font-bold text-blue-600">+₹{windowsPrice.toLocaleString('en-IN')}</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <button
                                onClick={() => handleAddFromModal(true)}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                Add with Windows 11 Pro (₹{(product.price * quantity + windowsPrice * quantity).toLocaleString('en-IN')})
                            </button>
                            <button
                                onClick={() => handleAddFromModal(false)}
                                className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-3 px-6 rounded-xl transition-colors"
                            >
                                Continue without Windows (₹{(product.price * quantity).toLocaleString('en-IN')})
                            </button>
                        </div>

                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
                            You can also check the Windows installation option above before adding to cart
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
