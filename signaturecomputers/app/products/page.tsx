'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import SidebarFilters from '@/components/SidebarFilters';
import ProductCard from '@/components/ProductCard';
import CategorySection from '@/components/CategorySection';
import AccessoriesSubcategorySection from '@/components/AccessoriesSubcategorySection';
import PrinterSubcategorySection from '@/components/PrinterSubcategorySection';
import { getAllProducts, Product } from '@/lib/products';


export default function ProductsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // State
    const [sortBy, setSortBy] = useState('newest');
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter State
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [priceRange, setPriceRange] = useState(5000);
    const [searchQueryText, setSearchQueryText] = useState('');

    // Initialize from URL
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

    useEffect(() => {
        async function fetchProducts() {
            setLoading(true);
            const data = await getAllProducts();
            setProducts(data);
            setLoading(false);
        }
        fetchProducts();
    }, []);

    // Accessory subcategory IDs
    const accessorySubcategories = [
        'keyboards', 'mouse', 'keyboard-mouse-combo', 'headphones', 'cables',
        'power-adapters', 'bags', 'docks', 'usb-flashdrives', 'dvd-writers'
    ];

    // Printer subcategory IDs
    const printerSubcategories = ['printers', 'cartridges', 'toners'];

    // Filter Logic
    const filteredProducts = products.filter(product => {
        const productCategory = product.category?.toLowerCase();
        const productName = product.name?.toLowerCase() || '';
        const productBrand = product.brand?.toLowerCase() || '';

        // Search Filter (if search query exists)
        if (searchQueryText) {
            const searchTerm = searchQueryText.toLowerCase();
            if (!productName.includes(searchTerm) && !productBrand.includes(searchTerm)) {
                return false;
            }
        }

        // Category Filter
        if (selectedCategory === 'all') {
            return true;
        }

        // If viewing 'accessories', show products from 'accessories' AND all accessory subcategories
        if (selectedCategory === 'accessories') {
            return productCategory === 'accessories' || accessorySubcategories.includes(productCategory || '');
        }

        // If viewing 'printers-all', show products from printers, cartridges, and toners
        if (selectedCategory === 'printers-all') {
            return printerSubcategories.includes(productCategory || '');
        }

        // Otherwise, match exact category
        if (productCategory !== selectedCategory.toLowerCase()) {
            return false;
        }

        return true;
    });

    // Sorting Logic
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (sortBy === 'price_low') return a.price - b.price;
        if (sortBy === 'price_high') return b.price - a.price;
        return 0; // newest not implemented yet (needs createdAt)
    });

    // Category name mapping for display
    const categoryNames: { [key: string]: string } = {
        'all': 'All Products',
        'laptops': 'Laptops',
        'desktops': 'Desktops',
        'workstations': 'Workstations',
        'monitors': 'Monitors',
        'printers': 'Printers',
        'accessories': 'All Accessories',
        'cartridges': 'Cartridges',
        'toners': 'Toners',
        'cctv': 'CCTV',
        // Accessories subcategories
        'keyboards': 'Keyboards',
        'mouse': 'Mouse',
        'keyboard-mouse-combo': 'Keyboard & Mouse Combo',
        'headphones': 'Headphones',
        'cables': 'Cables',
        'power-adapters': 'Power Adapters',
        'bags': 'Bags',
        'docks': 'Docks',
        'usb-flashdrives': 'USB Flash Drives',
        'dvd-writers': 'DVD Writers',
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

            {/* Show Printers Subcategory Cards when on 'Printers' view */}
            {selectedCategory === 'printers' && <PrinterSubcategorySection />}


            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="w-full md:w-64 flex-shrink-0">
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 sticky top-24">
                            <SidebarFilters
                                selectedCategory={selectedCategory}
                                onCategoryChange={handleCategoryChange}
                                priceRange={priceRange}
                                setPriceRange={setPriceRange}
                            />
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{pageTitle}</h1>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">Sort by:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="newest">Newest</option>
                                    <option value="price_low">Price: Low to High</option>
                                    <option value="price_high">Price: High to Low</option>
                                </select>
                            </div>
                        </div>

                        {/* Product Grid */}
                        {loading ? (
                            <div className="text-center py-12">Loading products...</div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-12">No products found.</div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {sortedProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
