'use client';

import { useState, useEffect } from 'react';
import { FiChevronDown, FiChevronUp, FiX } from 'react-icons/fi';

export interface FilterState {
    category: string;
    brands: string[];
    priceRange: [number, number];
    ram: string[];
    storage: string[];
    processor: string[];
    screenSize: string[];
    usageType: string[];
    availability: string;
    sortBy: string;
}

interface AdvancedFiltersProps {
    selectedFilters: FilterState;
    onFilterChange: (filters: FilterState) => void;
    availableBrands: string[];
    categoryType: string;
    productsCount?: number;
}

// Filter options based on category
const RAM_OPTIONS = ['4GB', '8GB', '16GB', '32GB', '64GB', '128GB'];
const STORAGE_OPTIONS = ['128GB', '256GB', '512GB', '1TB', '2TB'];
const PROCESSOR_OPTIONS = ['Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'Intel Core i9', 'AMD Ryzen 3', 'AMD Ryzen 5', 'AMD Ryzen 7', 'AMD Ryzen 9', 'Apple M1', 'Apple M2', 'Apple M3'];
const SCREEN_SIZE_OPTIONS = ['13"', '14"', '15.6"', '16"', '17"', '24"', '27"', '32"', '34"'];
const USAGE_OPTIONS = ['Office', 'Gaming', 'Student', 'Business', 'Creative', 'Home'];
const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'popularity', label: 'Popularity' },
    { value: 'name-asc', label: 'Name: A to Z' },
    { value: 'name-desc', label: 'Name: Z to A' },
];

export default function AdvancedFilters({
    selectedFilters,
    onFilterChange,
    availableBrands,
    categoryType,
    productsCount = 0,
}: AdvancedFiltersProps) {
    const [expandedSections, setExpandedSections] = useState<Set<string>>(
        new Set(['category', 'price', 'brand'])
    );
    const [minPrice, setMinPrice] = useState(selectedFilters.priceRange[0]);
    const [maxPrice, setMaxPrice] = useState(selectedFilters.priceRange[1]);

    const toggleSection = (section: string) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(section)) {
            newExpanded.delete(section);
        } else {
            newExpanded.add(section);
        }
        setExpandedSections(newExpanded);
    };

    const handleBrandChange = (brand: string) => {
        const newBrands = selectedFilters.brands.includes(brand)
            ? selectedFilters.brands.filter(b => b !== brand)
            : [...selectedFilters.brands, brand];
        onFilterChange({ ...selectedFilters, brands: newBrands });
    };

    const handleRamChange = (ram: string) => {
        const newRam = selectedFilters.ram.includes(ram)
            ? selectedFilters.ram.filter(r => r !== ram)
            : [...selectedFilters.ram, ram];
        onFilterChange({ ...selectedFilters, ram: newRam });
    };

    const handleStorageChange = (storage: string) => {
        const newStorage = selectedFilters.storage.includes(storage)
            ? selectedFilters.storage.filter(s => s !== storage)
            : [...selectedFilters.storage, storage];
        onFilterChange({ ...selectedFilters, storage: newStorage });
    };

    const handleProcessorChange = (processor: string) => {
        const newProcessor = selectedFilters.processor.includes(processor)
            ? selectedFilters.processor.filter(p => p !== processor)
            : [...selectedFilters.processor, processor];
        onFilterChange({ ...selectedFilters, processor: newProcessor });
    };

    const handleScreenSizeChange = (size: string) => {
        const newSizes = selectedFilters.screenSize.includes(size)
            ? selectedFilters.screenSize.filter(s => s !== size)
            : [...selectedFilters.screenSize, size];
        onFilterChange({ ...selectedFilters, screenSize: newSizes });
    };

    const handleUsageChange = (usage: string) => {
        const newUsage = selectedFilters.usageType.includes(usage)
            ? selectedFilters.usageType.filter(u => u !== usage)
            : [...selectedFilters.usageType, usage];
        onFilterChange({ ...selectedFilters, usageType: newUsage });
    };

    const handlePriceRangeApply = () => {
        onFilterChange({
            ...selectedFilters,
            priceRange: [minPrice, maxPrice],
        });
    };

    const handleAvailabilityChange = (availability: string) => {
        onFilterChange({
            ...selectedFilters,
            availability: selectedFilters.availability === availability ? '' : availability,
        });
    };

    const handleSortChange = (sortBy: string) => {
        onFilterChange({ ...selectedFilters, sortBy });
    };

    const clearAllFilters = () => {
        onFilterChange({
            category: selectedFilters.category,
            brands: [],
            priceRange: [0, 500000],
            ram: [],
            storage: [],
            processor: [],
            screenSize: [],
            usageType: [],
            availability: '',
            sortBy: 'newest',
        });
        setMinPrice(0);
        setMaxPrice(500000);
    };

    const activeFilterCount =
        selectedFilters.brands.length +
        selectedFilters.ram.length +
        selectedFilters.storage.length +
        selectedFilters.processor.length +
        selectedFilters.screenSize.length +
        selectedFilters.usageType.length +
        (selectedFilters.availability ? 1 : 0) +
        (selectedFilters.priceRange[0] > 0 || selectedFilters.priceRange[1] < 500000 ? 1 : 0);

    // Determine which filters to show based on category
    const showComputerFilters = ['laptops', 'desktops', 'workstations', 'all'].includes(categoryType);
    const showMonitorFilters = ['monitors'].includes(categoryType);
    const showAccessoryFilters = ['keyboards', 'mouse', 'headphones', 'keyboard-mouse-combo', 'accessories'].includes(categoryType);

    const FilterSection = ({
        title,
        sectionKey,
        children,
    }: {
        title: string;
        sectionKey: string;
        children: React.ReactNode;
    }) => (
        <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <button
                onClick={() => toggleSection(sectionKey)}
                className="flex items-center justify-between w-full py-2 text-left"
            >
                <span className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                    {title}
                </span>
                {expandedSections.has(sectionKey) ? (
                    <FiChevronUp className="text-gray-500" />
                ) : (
                    <FiChevronDown className="text-gray-500" />
                )}
            </button>
            {expandedSections.has(sectionKey) && (
                <div className="mt-3 space-y-2">{children}</div>
            )}
        </div>
    );

    const Checkbox = ({
        label,
        checked,
        onChange,
        count,
    }: {
        label: string;
        checked: boolean;
        onChange: () => void;
        count?: number;
    }) => (
        <label className="flex items-center justify-between cursor-pointer group">
            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={onChange}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className={`text-sm group-hover:text-blue-600 transition-colors ${checked ? 'font-medium text-blue-600' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                    {label}
                </span>
            </div>
            {count !== undefined && (
                <span className="text-xs text-gray-400">({count})</span>
            )}
        </label>
    );

    return (
        <div className="space-y-6">
            {/* Header with Results Count and Clear */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-semibold text-gray-900 dark:text-white">{productsCount}</span> products
                </p>
                {activeFilterCount > 0 && (
                    <button
                        onClick={clearAllFilters}
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                    >
                        <FiX className="w-3 h-3" />
                        Clear all ({activeFilterCount})
                    </button>
                )}
            </div>

            {/* Sort By */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <label className="text-xs font-medium text-gray-500 uppercase">Sort By</label>
                <select
                    value={selectedFilters.sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                    {SORT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Availability */}
            <FilterSection title="Availability" sectionKey="availability">
                <div className="flex gap-2">
                    <button
                        onClick={() => handleAvailabilityChange('in_stock')}
                        className={`flex-1 py-2 px-3 text-sm rounded-lg border transition-colors ${selectedFilters.availability === 'in_stock'
                                ? 'bg-green-100 border-green-500 text-green-700'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                            }`}
                    >
                        In Stock
                    </button>
                    <button
                        onClick={() => handleAvailabilityChange('out_of_stock')}
                        className={`flex-1 py-2 px-3 text-sm rounded-lg border transition-colors ${selectedFilters.availability === 'out_of_stock'
                                ? 'bg-red-100 border-red-500 text-red-700'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Out of Stock
                    </button>
                </div>
            </FilterSection>

            {/* Price Range */}
            <FilterSection title="Price Range" sectionKey="price">
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="flex-1">
                            <label className="text-xs text-gray-500">Min</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                                <input
                                    type="number"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(Number(e.target.value))}
                                    className="w-full pl-7 pr-3 py-2 border rounded-lg text-sm dark:bg-gray-900 dark:border-gray-700"
                                    placeholder="0"
                                />
                            </div>
                        </div>
                        <span className="text-gray-400 mt-4">-</span>
                        <div className="flex-1">
                            <label className="text-xs text-gray-500">Max</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                                <input
                                    type="number"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                                    className="w-full pl-7 pr-3 py-2 border rounded-lg text-sm dark:bg-gray-900 dark:border-gray-700"
                                    placeholder="500000"
                                />
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handlePriceRangeApply}
                        className="w-full py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Apply Price Filter
                    </button>
                    {/* Quick Price Buttons */}
                    <div className="flex flex-wrap gap-2">
                        {[
                            { label: 'Under ₹30K', min: 0, max: 30000 },
                            { label: '₹30K - ₹50K', min: 30000, max: 50000 },
                            { label: '₹50K - ₹80K', min: 50000, max: 80000 },
                            { label: '₹80K+', min: 80000, max: 500000 },
                        ].map((range) => (
                            <button
                                key={range.label}
                                onClick={() => {
                                    setMinPrice(range.min);
                                    setMaxPrice(range.max);
                                    onFilterChange({
                                        ...selectedFilters,
                                        priceRange: [range.min, range.max],
                                    });
                                }}
                                className={`px-3 py-1 text-xs rounded-full border transition-colors ${selectedFilters.priceRange[0] === range.min &&
                                        selectedFilters.priceRange[1] === range.max
                                        ? 'bg-blue-100 border-blue-500 text-blue-700'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'
                                    }`}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>
                </div>
            </FilterSection>

            {/* Brand */}
            <FilterSection title="Brand" sectionKey="brand">
                <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                    {availableBrands.length > 0 ? (
                        availableBrands.map((brand) => (
                            <Checkbox
                                key={brand}
                                label={brand}
                                checked={selectedFilters.brands.includes(brand)}
                                onChange={() => handleBrandChange(brand)}
                            />
                        ))
                    ) : (
                        ['HP', 'Dell', 'Lenovo', 'Asus', 'Acer', 'Apple', 'MSI', 'Samsung'].map((brand) => (
                            <Checkbox
                                key={brand}
                                label={brand}
                                checked={selectedFilters.brands.includes(brand)}
                                onChange={() => handleBrandChange(brand)}
                            />
                        ))
                    )}
                </div>
            </FilterSection>

            {/* RAM - Only for computers */}
            {showComputerFilters && (
                <FilterSection title="RAM" sectionKey="ram">
                    <div className="flex flex-wrap gap-2">
                        {RAM_OPTIONS.map((ram) => (
                            <button
                                key={ram}
                                onClick={() => handleRamChange(ram)}
                                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${selectedFilters.ram.includes(ram)
                                        ? 'bg-blue-100 border-blue-500 text-blue-700'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 text-gray-700 dark:text-gray-300'
                                    }`}
                            >
                                {ram}
                            </button>
                        ))}
                    </div>
                </FilterSection>
            )}

            {/* Storage - Only for computers */}
            {showComputerFilters && (
                <FilterSection title="Storage" sectionKey="storage">
                    <div className="flex flex-wrap gap-2">
                        {STORAGE_OPTIONS.map((storage) => (
                            <button
                                key={storage}
                                onClick={() => handleStorageChange(storage)}
                                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${selectedFilters.storage.includes(storage)
                                        ? 'bg-blue-100 border-blue-500 text-blue-700'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 text-gray-700 dark:text-gray-300'
                                    }`}
                            >
                                {storage}
                            </button>
                        ))}
                    </div>
                </FilterSection>
            )}

            {/* Processor - Only for computers */}
            {showComputerFilters && (
                <FilterSection title="Processor" sectionKey="processor">
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                        {PROCESSOR_OPTIONS.map((processor) => (
                            <Checkbox
                                key={processor}
                                label={processor}
                                checked={selectedFilters.processor.includes(processor)}
                                onChange={() => handleProcessorChange(processor)}
                            />
                        ))}
                    </div>
                </FilterSection>
            )}

            {/* Screen Size - For laptops and monitors */}
            {(showComputerFilters || showMonitorFilters) && (
                <FilterSection title="Screen Size" sectionKey="screenSize">
                    <div className="flex flex-wrap gap-2">
                        {SCREEN_SIZE_OPTIONS.map((size) => (
                            <button
                                key={size}
                                onClick={() => handleScreenSizeChange(size)}
                                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${selectedFilters.screenSize.includes(size)
                                        ? 'bg-blue-100 border-blue-500 text-blue-700'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 text-gray-700 dark:text-gray-300'
                                    }`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </FilterSection>
            )}

            {/* Usage Type */}
            {showComputerFilters && (
                <FilterSection title="Usage Type" sectionKey="usage">
                    <div className="space-y-2">
                        {USAGE_OPTIONS.map((usage) => (
                            <Checkbox
                                key={usage}
                                label={usage}
                                checked={selectedFilters.usageType.includes(usage)}
                                onChange={() => handleUsageChange(usage)}
                            />
                        ))}
                    </div>
                </FilterSection>
            )}
        </div>
    );
}
