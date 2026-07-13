'use client';

import { useState } from 'react';

interface SidebarFiltersProps {
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    priceRange: number;
    setPriceRange: (range: number) => void;
}

export default function SidebarFilters({
    selectedCategory,
    onCategoryChange,
    priceRange,
    setPriceRange
}: SidebarFiltersProps) {
    const categories = [
        { id: 'all', name: 'All Products' },
        { id: 'laptops', name: 'Laptops' },
        { id: 'desktops', name: 'Desktops' },
        { id: 'workstations', name: 'Workstations' },
        { id: 'monitors', name: 'Monitors' },
        { id: 'memory', name: 'Memory' },
        { id: 'storage', name: 'Storage' },
        { id: 'graphics-cards', name: 'Graphics Cards' },
        { id: 'keyboards', name: 'Keyboards' },
        { id: 'headphones', name: 'Headphones' },
        { id: 'cables', name: 'Cables' },
        { id: 'power-adapters', name: 'Power Adapters' },
        { id: 'mouse', name: 'Mouse' },
        { id: 'keyboard-mouse-combo', name: 'Keyboard & Mouse Combo' },
        { id: 'bags', name: 'Bags' },
        { id: 'docks', name: 'Docks' },
        { id: 'hubs', name: 'Hubs' },
        { id: 'usb-flashdrives', name: 'USB Flash Drives' },
        { id: 'webcams', name: 'Webcam' },
        { id: 'dvd-writers', name: 'Others' },
        { id: 'cctv', name: 'CCTV' },
    ];

    return (
        <div className="space-y-8">
            {/* Category Filter */}
            <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Categories</h3>
                <div className="space-y-2">
                    {categories.map((cat) => (
                        <label key={cat.id} className="flex items-center space-x-2 cursor-pointer group">
                            <input
                                type="radio"
                                name="category"
                                value={cat.id}
                                checked={selectedCategory === cat.id}
                                onChange={() => onCategoryChange(cat.id)}
                                className="text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className={`text-sm group-hover:text-blue-600 transition-colors ${selectedCategory === cat.id ? 'font-semibold text-blue-600' : 'text-gray-700 dark:text-gray-300'}`}>
                                {cat.name}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

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
            {/* ... brands/ram ... */}


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
