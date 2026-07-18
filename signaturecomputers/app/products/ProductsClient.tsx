'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductFilters from '@/components/ProductFilters';
import ProductCard from '@/components/ProductCard';
import CategorySection from '@/components/CategorySection';
import AccessoriesSubcategorySection from '@/components/AccessoriesSubcategorySection';
import MemoryStorageSubcategorySection from '@/components/MemoryStorageSubcategorySection';
import { Product } from '@/lib/products';
import { FiLoader, FiGrid, FiList } from 'react-icons/fi';

interface ProductsClientProps {
    initialProducts: Product[];
    initialCategory: string;
    initialSearch: string;
}

export default function ProductsClient({
    initialProducts,
    initialCategory,
    initialSearch
}: ProductsClientProps) {
    const searchParams = useSearchParams();
    const router = useRouter();

    // State
    const [sortBy, setSortBy] = useState('newest');
    const [products] = useState<Product[]>(initialProducts);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialProducts);
    const [displayProducts, setDisplayProducts] = useState<Product[]>(initialProducts);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Filter State
    const [selectedCategory, setSelectedCategory] = useState(initialCategory);
    const [priceRange, setPriceRange] = useState<[number, number]>(() => {
        if (initialProducts.length > 0) {
            const prices = initialProducts.map(p => p.price);
            return [Math.min(...prices), Math.max(...prices)];
        }
        return [0, 500000];
    });
    const [searchQueryText, setSearchQueryText] = useState(initialSearch);

    // Initialize from URL when they change
    useEffect(() => {
        const categoryParam = searchParams.get('category');
        const searchParam = searchParams.get('search');

        if (categoryParam) {
            setSelectedCategory(categoryParam.toLowerCase());
        } else {
            setSelectedCategory('all');
        }

        setSearchQueryText(searchParam || '');
    }, [searchParams]);

    // Handle Category Change
    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
        if (category === 'all') {
            router.push('/products', { scroll: false });
        } else {
            router.push(`/products?category=${category}`, { scroll: false });
        }
    };

    // Accessory subcategory IDs
    const accessorySubcategories = [
        'keyboards', 'mouse', 'keyboard-mouse-combo', 'headphones', 'cables',
        'power-adapters', 'bags', 'docks', 'hubs', 'usb-flashdrives', 'dvd-writers',
        'webcams', 'others'
    ];

    // Memory & Storage subcategory IDs
    const memoryStorageSubcategories = ['memory', 'storage', 'graphics-cards'];

    // Filter by category and search first
    useEffect(() => {
        let result = [...products];

        // Search Filter (if search query exists)
        if (searchQueryText) {
            const searchTerm = searchQueryText.toLowerCase();
            result = result.filter(product => {
                const productName = product.name?.toLowerCase() || '';
                const productBrand = product.brand?.toLowerCase() || '';
                return productName.includes(searchTerm) || productBrand.includes(searchTerm);
            });
        }

        // Category Filter
        if (selectedCategory !== 'all') {
            const productCategory = (p: Product) => {
                if (p.category?.toLowerCase() === 'dvd-writers') {
                    if (p.productInfo?.othersType === 'webcam') return 'webcams';
                    if (p.productInfo?.othersType === 'other') return 'others';
                    return 'dvd-writers';
                }
                return p.category?.toLowerCase();
            };

            if (selectedCategory === 'accessories') {
                result = result.filter(p =>
                    productCategory(p) === 'accessories' || accessorySubcategories.includes(productCategory(p) || '')
                );
            } else if (selectedCategory === 'memory-storage' || selectedCategory === 'memory-storage-all') {
                result = result.filter(p => memoryStorageSubcategories.includes(productCategory(p) || ''));
            } else {
                result = result.filter(p => productCategory(p) === selectedCategory.toLowerCase());
            }
        }

        setFilteredProducts(result);
    }, [products, selectedCategory, searchQueryText]);

    // Dynamically adjust price range bounds when filtered category products change
    useEffect(() => {
        if (filteredProducts.length > 0) {
            const prices = filteredProducts.map(p => p.price);
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            setPriceRange([minPrice, maxPrice]);
        }
    }, [filteredProducts]);

    // Handle filter change from ProductFilters component
    const handleFilterChange = useCallback((filtered: Product[]) => {
        setDisplayProducts(filtered);
    }, []);

    // Sorting Logic
    const sortedProducts = [...displayProducts].sort((a, b) => {
        if (sortBy === 'price_low') return a.price - b.price;
        if (sortBy === 'price_high') return b.price - a.price;
        if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
        if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
        return 0;
    });

    // Category name mapping for display
    const categoryNames: { [key: string]: string } = {
        'all': 'All Products',
        'laptops': 'Laptops',
        'desktops': 'Desktops',
        'workstations': 'Workstations',
        'monitors': 'Monitors',
        'memory-storage': 'Memory, Storage & Graphics',
        'memory': 'Memory',
        'storage': 'Storage',
        'graphics-cards': 'Graphics Cards',
        'accessories': 'All Accessories',
        'cctv': 'CCTV',
        'keyboards': 'Keyboards',
        'mouse': 'Mouse',
        'keyboard-mouse-combo': 'Keyboard & Mouse Combo',
        'headphones': 'Headphones',
        'cables': 'Cables',
        'power-adapters': 'Power Adapters',
        'bags': 'Bags',
        'docks': 'Docks',
        'hubs': 'Hubs',
        'usb-flashdrives': 'USB Flash Drives',
        'dvd-writers': 'Others',
        'webcams': 'Webcam',
    };

    // Get display title based on selected category or search query
    const pageTitle = searchQueryText
        ? `Search results for "${searchQueryText}"`
        : (categoryNames[selectedCategory] || selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1));

    return (
        <div className="bg-gray-50 dark:bg-black min-h-screen">
            {/* Show Category Cards ONLY when on 'All Products' view */}
            {selectedCategory === 'all' && <CategorySection />}

            {/* Show Accessories Subcategory Cards when on 'Accessories' view */}
            {selectedCategory === 'accessories' && <AccessoriesSubcategorySection />}

            {/* Show Memory & Storage Subcategory Cards when on 'Memory & Storage' view */}
            {selectedCategory === 'memory-storage' && <MemoryStorageSubcategorySection />}

            <div className="w-full px-4 sm:px-8 lg:px-12 py-8">
                {/* Page Header */}
                <div className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{pageTitle}</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Showing <span className="text-blue-600 font-medium">{sortedProducts.length}</span> of <span className="text-blue-600 font-medium">{filteredProducts.length}</span> products
                    </p>
                </div>

                <div className="flex gap-6 lg:gap-8">
                    {/* Sidebar - Desktop Only */}
                    <aside className="hidden md:block w-64 lg:w-72 flex-shrink-0">
                        <div className="bg-white dark:bg-gray-900 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 sticky top-24 max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar">
                            <ProductFilters
                                products={filteredProducts}
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

                        {/* Product Grid/List */}
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <FiLoader className="text-3xl text-blue-600 animate-spin mb-4" />
                                <p className="text-gray-500">Loading products...</p>
                            </div>
                        ) : sortedProducts.length === 0 ? (
                            <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                    <FiLoader className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">No products found</p>
                                <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or search terms.</p>
                            </div>
                        ) : viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-6 gap-4 lg:gap-6">
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
                                        <div className="w-32 h-32 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden relative">
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
                                            {product.stock === 0 ? (
                                                <div className="mt-2">
                                                    <span className="text-xs font-semibold text-red-600 dark:text-red-500">Unavailable</span>
                                                </div>
                                            ) : (
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
                                            )}
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
                    products={filteredProducts}
                    onFilterChange={handleFilterChange}
                    priceRange={priceRange}
                    setPriceRange={setPriceRange}
                    mode="mobile"
                />
            </div>
        </div>
    );
}
