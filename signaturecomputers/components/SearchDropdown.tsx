'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FiSearch, FiLoader } from 'react-icons/fi';
import { searchProducts, SearchResults, CATEGORY_NAMES } from '@/lib/products';

interface SearchDropdownProps {
    searchQuery: string;
    setSearchQuery: (value: string) => void;
    isOpen: boolean;
    onClose: () => void;
    onSelect?: (name: string) => void;
}

export default function SearchDropdown({
    searchQuery,
    setSearchQuery,
    isOpen,
    onClose,
    onSelect,
}: SearchDropdownProps) {
    const router = useRouter();
    const [results, setResults] = useState<SearchResults>({ products: [], categories: [] });
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Debounced search
    useEffect(() => {
        if (!searchQuery || searchQuery.length < 2) {
            setResults({ products: [], categories: [] });
            return;
        }

        const debounceTimer = setTimeout(async () => {
            setLoading(true);
            const searchResults = await searchProducts(searchQuery);
            setResults(searchResults);
            setLoading(false);
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [searchQuery]);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                onClose();
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    const handleProductClick = (productId: string, productName: string) => {
        setSearchQuery(productName);
        onSelect?.(productName);
        onClose();
        router.push(`/product/${productId}`);
    };

    const handleCategoryClick = (categoryId: string, categoryName: string) => {
        setSearchQuery(categoryName);
        onSelect?.(categoryName);
        onClose();
        router.push(`/products?category=${categoryId}`);
    };

    if (!isOpen || searchQuery.length < 2) return null;

    const hasResults = results.products.length > 0 || results.categories.length > 0;

    return (
        <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 max-h-[400px] overflow-y-auto"
        >
            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <FiLoader className="w-6 h-6 text-blue-600 animate-spin" />
                    <span className="ml-2 text-gray-500">Searching...</span>
                </div>
            ) : !hasResults ? (
                <div className="py-8 text-center">
                    <FiSearch className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No results found for "{searchQuery}"</p>
                </div>
            ) : (
                <>
                    {/* Categories Section */}
                    {results.categories.length > 0 && (
                        <div className="border-b border-gray-100">
                            <div className="px-4 py-2 bg-gray-50">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Categories</span>
                            </div>
                            {results.categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => handleCategoryClick(category.id, category.name)}
                                    className="w-full px-4 py-3 flex items-center hover:bg-blue-50 transition-colors text-left"
                                >
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center mr-3">
                                        <FiSearch className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{category.name}</p>
                                        <p className="text-xs text-gray-500">Browse category</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Products Section */}
                    {results.products.length > 0 && (
                        <div>
                            <div className="px-4 py-2 bg-gray-50">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Products</span>
                            </div>
                            {results.products.map((product) => (
                                <button
                                    key={product.id}
                                    onClick={() => handleProductClick(product.id, product.name)}
                                    className="w-full px-4 py-3 flex items-center hover:bg-blue-50 transition-colors text-left"
                                >
                                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 mr-3">
                                        {product.image ? (
                                            <Image
                                                src={product.image}
                                                alt={product.name}
                                                width={48}
                                                height={48}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <FiSearch className="w-5 h-5" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">{product.name}</p>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-blue-600 font-semibold">₹{product.price.toLocaleString()}</span>
                                            <span className="text-gray-400">•</span>
                                            <span className="text-gray-500 truncate">{CATEGORY_NAMES[product.category] || product.category}</span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
