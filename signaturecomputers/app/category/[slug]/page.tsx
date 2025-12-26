'use client';

import { useParams } from 'next/navigation';
import ProductFilters from '@/components/ProductFilters';
import ProductCard from '@/components/ProductCard';
import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product, CATEGORY_NAMES } from '@/lib/products';
import { FiLoader, FiGrid, FiList } from 'react-icons/fi';

// Map URL slugs to Firestore collection names
const SLUG_TO_COLLECTION: Record<string, string> = {
    'laptops': 'laptops',
    'desktops': 'desktops',
    'workstations': 'workstations',
    'monitors': 'monitors',
    'printers': 'printers',
    'accessories': 'accessories',
    'cartridges': 'cartridges',
    'toners': 'toners',
    'cctv': 'cctv',
    'keyboards': 'keyboards',
    'mouse': 'mouse',
    'keyboard-mouse-combo': 'keyboard-mouse-combo',
    'headphones': 'headphones',
    'cables': 'cables',
    'power-adapters': 'power-adapters',
    'bags': 'bags',
    'docks': 'docks',
    'usb-flashdrives': 'usb-flashdrives',
    'dvd-writers': 'dvd-writers',
};

export default function CategoryPage() {
    const params = useParams();
    const slug = typeof params.slug === 'string' ? params.slug : '';

    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('newest');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Fetch products from Firestore
    useEffect(() => {
        async function fetchProducts() {
            setLoading(true);
            try {
                const collectionName = SLUG_TO_COLLECTION[slug];

                if (!collectionName) {
                    console.warn(`Unknown category slug: ${slug}`);
                    setProducts([]);
                    setLoading(false);
                    return;
                }

                const querySnapshot = await getDocs(collection(db, collectionName));
                const fetchedProducts: Product[] = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        name: data.name || 'Unnamed Product',
                        brand: data.brand || '',
                        price: data.price || 0,
                        originalPrice: data.originalPrice,
                        stock: data.stock || 0,
                        images: data.images || [],
                        description: data.description || '',
                        specs: data.specs || {},
                        category: collectionName,
                        image: data.images?.[0] || '',
                        rating: data.rating || 4.5,
                        productInfo: data.productInfo,
                    };
                });

                setProducts(fetchedProducts);
                setFilteredProducts(fetchedProducts);

                // Set initial price range based on products
                if (fetchedProducts.length > 0) {
                    const prices = fetchedProducts.map(p => p.price);
                    const minPrice = Math.floor(Math.min(...prices) / 1000) * 1000;
                    const maxPrice = Math.ceil(Math.max(...prices) / 1000) * 1000;
                    setPriceRange([minPrice, maxPrice]);
                }
            } catch (error) {
                console.error('Error fetching products:', error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        }

        if (slug) {
            fetchProducts();
        }
    }, [slug]);

    // Handle filter change from ProductFilters component
    const handleFilterChange = useCallback((filtered: Product[]) => {
        setFilteredProducts(filtered);
    }, []);

    // Sort products
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        switch (sortBy) {
            case 'price_low':
                return a.price - b.price;
            case 'price_high':
                return b.price - a.price;
            case 'name_asc':
                return a.name.localeCompare(b.name);
            case 'name_desc':
                return b.name.localeCompare(a.name);
            case 'newest':
            default:
                return 0;
        }
    });

    // Format slug for title
    const title = CATEGORY_NAMES[slug] || (slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : 'Category');

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-black">
                <FiLoader className="text-4xl text-blue-600 animate-spin mb-4" />
                <p className="text-gray-500">Loading products...</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 dark:bg-black min-h-screen">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Header */}
                <div className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Showing <span className="text-blue-600 font-medium">{sortedProducts.length}</span> of <span className="text-blue-600 font-medium">{products.length}</span> products
                    </p>
                </div>

                <div className="flex gap-6 lg:gap-8">
                    {/* Sidebar Filters - Desktop Only */}
                    <aside className="hidden md:block w-64 lg:w-72 flex-shrink-0">
                        <div className="bg-white dark:bg-gray-900 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 sticky top-24">
                            <ProductFilters
                                products={products}
                                onFilterChange={handleFilterChange}
                                priceRange={priceRange}
                                setPriceRange={setPriceRange}
                                mode="sidebar"
                            />
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                        {/* Toolbar */}
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-3">
                                {/* View Mode Toggle */}
                                <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 rounded-md transition-colors ${viewMode === 'grid'
                                            ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                        title="Grid View"
                                    >
                                        <FiGrid size={18} />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 rounded-md transition-colors ${viewMode === 'list'
                                            ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                        title="List View"
                                    >
                                        <FiList size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-500 hidden sm:inline">Sort by:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-3 py-2 min-w-[160px]"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="price_low">Price: Low to High</option>
                                    <option value="price_high">Price: High to Low</option>
                                    <option value="name_asc">Name: A to Z</option>
                                    <option value="name_desc">Name: Z to A</option>
                                </select>
                            </div>
                        </div>

                        {/* Products */}
                        {sortedProducts.length === 0 ? (
                            <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                    <FiLoader className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">No products found</p>
                                <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or check back later.</p>
                            </div>
                        ) : viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                                {sortedProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {sortedProducts.map((product) => (
                                    <div
                                        key={product.id}
                                        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 flex gap-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="w-32 h-32 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                                            <img
                                                src={product.image || '/placeholder-product.png'}
                                                alt={product.name}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                                {product.name}
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">{product.brand}</p>
                                            <div className="mt-2">
                                                <span className="text-lg font-bold text-gray-900 dark:text-white">
                                                    ₹{product.price.toLocaleString('en-IN')}
                                                </span>
                                                {product.originalPrice && product.originalPrice > product.price && (
                                                    <span className="ml-2 text-sm text-gray-400 line-through">
                                                        ₹{product.originalPrice.toLocaleString('en-IN')}
                                                    </span>
                                                )}
                                            </div>
                                            <a
                                                href={`/product/${product.id}`}
                                                className="inline-block mt-3 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                View Details
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Filters - Only floating button and drawer */}
            <div className="md:hidden">
                <ProductFilters
                    products={products}
                    onFilterChange={handleFilterChange}
                    priceRange={priceRange}
                    setPriceRange={setPriceRange}
                    mode="mobile"
                />
            </div>
        </div>
    );
}
