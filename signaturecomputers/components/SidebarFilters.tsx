'use client';

import { useState } from 'react';

export default function SidebarFilters() {
    const [priceRange, setPriceRange] = useState(1000);

    return (
        <div className="space-y-8">
            {/* Price Filter */}
            <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Price Range</h3>
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>$0</span>
                    <span>${priceRange}</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="5000"
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
            </div>

            {/* Brand Filter */}
            <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Brands</h3>
                <div className="space-y-2">
                    {['Dell', 'HP', 'Lenovo', 'Apple', 'Asus'].map((brand) => (
                        <label key={brand} className="flex items-center space-x-2">
                            <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{brand}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* RAM Filter */}
            <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">RAM</h3>
                <div className="space-y-2">
                    {['8GB', '16GB', '32GB', '64GB'].map((ram) => (
                        <label key={ram} className="flex items-center space-x-2">
                            <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{ram}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
}
