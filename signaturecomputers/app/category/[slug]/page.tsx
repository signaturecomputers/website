'use client';

import { useParams } from 'next/navigation';
import SidebarFilters from '@/components/SidebarFilters';
import ProductCard from '@/components/ProductCard';
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product, CATEGORY_NAMES } from '@/lib/products';
import { FiLoader } from 'react-icons/fi';

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
    const [selectedCategory, setSelectedCategory] = useState(slug || 'all');
    const [priceRange, setPriceRange] = useState(500000); // Max price range in INR

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

    // Filter and sort products
    useEffect(() => {
        let result = [...products];

        // Filter by price range
        result = result.filter(p => p.price <= priceRange);

        // Sort products
        switch (sortBy) {
            case 'price_low':
                result.sort((a, b) => a.price - b.price);
                break;
            case 'price_high':
                result.sort((a, b) => b.price - a.price);
                break;
            case 'name_asc':
                result.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'newest':
            default:
                // Keep original order (newest first if data has timestamps)
                break;
        }

        setFilteredProducts(result);
    }, [products, priceRange, sortBy]);

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
        <div className="bg-gray-50 dark:bg-black min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="w-full md:w-64 flex-shrink-0">
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 sticky top-24">
                            <SidebarFilters
                                selectedCategory={selectedCategory}
                                onCategoryChange={setSelectedCategory}
                                priceRange={priceRange}
                                setPriceRange={setPriceRange}
                            />
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
                                <p className="text-sm text-gray-500 mt-1">
                                    {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">Sort by:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 px-3 py-2"
                                >
                                    <option value="newest">Newest</option>
                                    <option value="price_low">Price: Low to High</option>
                                    <option value="price_high">Price: High to Low</option>
                                    <option value="name_asc">Name: A to Z</option>
                                </select>
                            </div>
                        </div>

                        {filteredProducts.length === 0 ? (
                            <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                                <p className="text-gray-500 text-lg">No products found in this category.</p>
                                <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or check back later.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredProducts.map((product) => (
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
