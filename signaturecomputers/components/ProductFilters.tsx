'use client';

import { useState, useEffect, useMemo } from 'react';
import { FiChevronDown, FiChevronUp, FiX, FiFilter, FiCheck } from 'react-icons/fi';
import { Product } from '@/lib/products';

interface ProductFiltersProps {
    products: Product[];
    onFilterChange: (filteredProducts: Product[]) => void;
    priceRange: [number, number];
    setPriceRange: (range: [number, number]) => void;
    mode?: 'sidebar' | 'mobile'; // Control what to render
}

// Collapsible filter section component
function FilterAccordion({
    title,
    children,
    defaultOpen = true,
    count = 0
}: {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
    count?: number;
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between py-2 text-left group"
            >
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
                        {title}
                    </span>
                    {count > 0 && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full">
                            {count}
                        </span>
                    )}
                </div>
                <span className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                    {isOpen ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                </span>
            </button>
            <div className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-[400px] opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
                <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {children}
                </div>
            </div>
        </div>
    );
}

// Checkbox filter item
function FilterCheckbox({
    label,
    count,
    checked,
    onChange
}: {
    label: string;
    count: number;
    checked: boolean;
    onChange: () => void;
}) {
    return (
        <label className="flex items-center gap-3 py-1.5 cursor-pointer group">
            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all
                ${checked
                    ? 'bg-blue-600 border-blue-600'
                    : 'border-gray-300 dark:border-gray-600 group-hover:border-blue-400'}`}
            >
                {checked && <FiCheck className="text-white" size={12} />}
            </div>
            <span className={`text-sm flex-1 ${checked ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                {label}
            </span>
            <span className="text-xs text-gray-400">({count})</span>
        </label>
    );
}


// Helper functions for normalization
const normalizeGraphics = (gpu: string): string => {
    if (!gpu) return '';
    const lower = gpu.toLowerCase();

    // Intel
    if (lower.includes('intel') && lower.includes('uhd')) return 'Intel UHD Graphics';
    if (lower.includes('intel') && lower.includes('iris') && lower.includes('xe')) return 'Intel Iris Xe Graphics';
    if (lower.includes('intel') && lower.includes('arc')) return 'Intel Arc Graphics';

    // AMD
    if (lower.includes('amd') && lower.includes('radeon')) return 'AMD Radeon Graphics';

    // NVIDIA
    if (lower.includes('rtx') && lower.includes('3050')) return 'NVIDIA RTX 3050';
    if (lower.includes('rtx') && lower.includes('4050')) return 'NVIDIA RTX 4050';
    if (lower.includes('rtx') && lower.includes('4060')) return 'NVIDIA RTX 4060';
    if (lower.includes('rtx') && lower.includes('3060')) return 'NVIDIA RTX 3060';
    if (lower.includes('gtx') && lower.includes('1650')) return 'NVIDIA GTX 1650';

    return gpu.trim(); // Fallback to original
};

const normalizeOS = (os: string): string => {
    if (!os) return '';
    const lower = os.toLowerCase().replace(/[^a-z0-9]/g, ''); // remove spaces and special chars

    if (lower.includes('freedos')) return 'Free DOS';
    if (lower.includes('win11pro') || lower.includes('windows11pro') || lower.includes('windows11professional')) return 'Windows 11 Pro';
    if (lower.includes('win11home') || lower.includes('windows11home')) return 'Windows 11 Home';
    if (lower.includes('win10pro') || lower.includes('windows10pro') || lower.includes('windows10professional')) return 'Windows 10 Pro';
    if (lower.includes('win10home') || lower.includes('windows10home')) return 'Windows 10 Home';
    if (lower.includes('ubuntu')) return 'Ubuntu';
    if (lower.includes('linux')) return 'Linux';
    if (lower.includes('macos')) return 'macOS';

    return os.trim();
};

export default function ProductFilters({
    products,
    onFilterChange,
    priceRange,
    setPriceRange,
    mode = 'sidebar'
}: ProductFiltersProps) {
    // Selected filters state
    const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
    const [selectedProcessors, setSelectedProcessors] = useState<string[]>([]);
    const [selectedRAM, setSelectedRAM] = useState<string[]>([]);
    const [selectedStorage, setSelectedStorage] = useState<string[]>([]);
    const [selectedDisplaySizes, setSelectedDisplaySizes] = useState<string[]>([]);
    const [selectedOS, setSelectedOS] = useState<string[]>([]);
    const [selectedGraphics, setSelectedGraphics] = useState<string[]>([]);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Calculate price bounds from products
    const priceBounds = useMemo(() => {
        if (products.length === 0) return { min: 0, max: 500000 };
        const prices = products.map(p => p.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        return {
            // Round min down to nearest 1000
            min: Math.floor(minPrice / 1000) * 1000,
            // Round max up to nearest 1000
            max: Math.ceil(maxPrice / 1000) * 1000
        };
    }, [products]);

    // Extract unique filter options from products
    const filterOptions = useMemo(() => {
        const brands = new Map<string, number>();
        const processors = new Map<string, number>();
        const ram = new Map<string, number>();
        const storage = new Map<string, number>();
        const displaySizes = new Map<string, number>();
        const os = new Map<string, number>();
        const graphics = new Map<string, number>();

        products.forEach(product => {
            // Brand
            if (product.brand) {
                const brand = product.brand.trim();
                brands.set(brand, (brands.get(brand) || 0) + 1);
            }

            // From productInfo
            const info = product.productInfo;
            if (info) {
                // Processor Brand/Generation
                if (info.processor?.brand) {
                    const proc = info.processor.brand.trim();
                    processors.set(proc, (processors.get(proc) || 0) + 1);
                } else if (info.processor?.name) {
                    const procName = info.processor.name.trim();
                    const procBrand = procName.split(' ')[0];
                    if (procBrand) {
                        processors.set(procBrand, (processors.get(procBrand) || 0) + 1);
                    }
                }

                // RAM Capacity
                if (info.memory?.capacity) {
                    const ramVal = info.memory.capacity.trim();
                    ram.set(ramVal, (ram.get(ramVal) || 0) + 1);
                }

                // Storage Capacity
                if (info.storage?.primaryStorage?.capacity) {
                    const storageVal = info.storage.primaryStorage.capacity.trim();
                    storage.set(storageVal, (storage.get(storageVal) || 0) + 1);
                }

                // Display Size
                if (info.display?.size) {
                    const displayVal = info.display.size.trim();
                    displaySizes.set(displayVal, (displaySizes.get(displayVal) || 0) + 1);
                }

                // Operating System
                if (info.operatingSystem?.os) {
                    const osVal = normalizeOS(info.operatingSystem.os);
                    if (osVal) {
                        os.set(osVal, (os.get(osVal) || 0) + 1);
                    }
                }

                // Graphics
                if (info.graphics?.gpu) {
                    const gpuVal = normalizeGraphics(info.graphics.gpu);
                    if (gpuVal) {
                        graphics.set(gpuVal, (graphics.get(gpuVal) || 0) + 1);
                    }
                }
            }

            // Fallback to specs object
            if (product.specs) {
                if (!info?.processor && product.specs['Processor']) {
                    const procName = product.specs['Processor'].trim();
                    const procBrand = procName.split(' ')[0];
                    if (procBrand && !processors.has(procBrand)) {
                        processors.set(procBrand, (processors.get(procBrand) || 0) + 1);
                    }
                }
                if (!info?.memory && product.specs['RAM']) {
                    const ramVal = product.specs['RAM'].trim();
                    if (!ram.has(ramVal)) {
                        ram.set(ramVal, (ram.get(ramVal) || 0) + 1);
                    }
                }
                if (!info?.storage && product.specs['Storage']) {
                    const storageVal = product.specs['Storage'].trim();
                    if (!storage.has(storageVal)) {
                        storage.set(storageVal, (storage.get(storageVal) || 0) + 1);
                    }
                }
                // Fallback OS/Graphics normalization if in specs
                if (!info?.operatingSystem && product.specs['Operating System']) {
                    const osVal = normalizeOS(product.specs['Operating System']);
                    if (osVal) os.set(osVal, (os.get(osVal) || 0) + 1);
                }
                if (!info?.graphics && product.specs['Graphics']) {
                    const gpuVal = normalizeGraphics(product.specs['Graphics']);
                    if (gpuVal) graphics.set(gpuVal, (graphics.get(gpuVal) || 0) + 1);
                }
            }
        });

        // Helper to convert map to sorted array
        const mapToArray = (map: Map<string, number>) =>
            Array.from(map.entries())
                .map(([value, count]) => ({ value, count }))
                .sort((a, b) => b.count - a.count);

        return {
            brands: mapToArray(brands),
            processors: mapToArray(processors),
            ram: mapToArray(ram),
            storage: mapToArray(storage),
            displaySizes: mapToArray(displaySizes),
            os: mapToArray(os),
            graphics: mapToArray(graphics)
        };
    }, [products]);

    // Apply filters
    useEffect(() => {
        let filtered = [...products];

        // Price filter
        filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

        // Brand filter
        if (selectedBrands.length > 0) {
            filtered = filtered.filter(p => selectedBrands.includes(p.brand));
        }

        // Processor filter
        if (selectedProcessors.length > 0) {
            filtered = filtered.filter(p => {
                const procBrand = p.productInfo?.processor?.brand ||
                    p.productInfo?.processor?.name?.split(' ')[0] ||
                    p.specs?.['Processor']?.split(' ')[0];
                return procBrand && selectedProcessors.includes(procBrand);
            });
        }

        // RAM filter
        if (selectedRAM.length > 0) {
            filtered = filtered.filter(p => {
                const ramVal = p.productInfo?.memory?.capacity || p.specs?.['RAM'];
                return ramVal && selectedRAM.includes(ramVal.trim());
            });
        }

        // Storage filter
        if (selectedStorage.length > 0) {
            filtered = filtered.filter(p => {
                const storageVal = p.productInfo?.storage?.primaryStorage?.capacity || p.specs?.['Storage'];
                return storageVal && selectedStorage.includes(storageVal.trim());
            });
        }

        // Display Size filter
        if (selectedDisplaySizes.length > 0) {
            filtered = filtered.filter(p => {
                const displayVal = p.productInfo?.display?.size;
                return displayVal && selectedDisplaySizes.includes(displayVal.trim());
            });
        }

        // OS filter
        if (selectedOS.length > 0) {
            filtered = filtered.filter(p => {
                const osValRaw = p.productInfo?.operatingSystem?.os || p.specs?.['Operating System'];
                if (!osValRaw) return false;
                const osVal = normalizeOS(osValRaw);
                return selectedOS.includes(osVal);
            });
        }

        // Graphics filter
        if (selectedGraphics.length > 0) {
            filtered = filtered.filter(p => {
                const gpuValRaw = p.productInfo?.graphics?.gpu || p.specs?.['Graphics'];
                if (!gpuValRaw) return false;
                const gpuVal = normalizeGraphics(gpuValRaw);
                return selectedGraphics.includes(gpuVal);
            });
        }

        onFilterChange(filtered);
    }, [products, priceRange, selectedBrands, selectedProcessors, selectedRAM, selectedStorage, selectedDisplaySizes, selectedOS, selectedGraphics, onFilterChange]);

    // Calculate active filter count
    const activeFilterCount =
        selectedBrands.length +
        selectedProcessors.length +
        selectedRAM.length +
        selectedStorage.length +
        selectedDisplaySizes.length +
        selectedOS.length +
        selectedGraphics.length +
        (priceRange[0] > 0 || priceRange[1] < priceBounds.max ? 1 : 0);

    // Clear all filters
    const clearAllFilters = () => {
        setSelectedBrands([]);
        setSelectedProcessors([]);
        setSelectedRAM([]);
        setSelectedStorage([]);
        setSelectedDisplaySizes([]);
        setSelectedOS([]);
        setSelectedGraphics([]);
        setPriceRange([0, priceBounds.max]);
    };

    // Toggle filter helper
    const toggleFilter = (
        value: string,
        selected: string[],
        setSelected: React.Dispatch<React.SetStateAction<string[]>>
    ) => {
        if (selected.includes(value)) {
            setSelected(selected.filter(v => v !== value));
        } else {
            setSelected([...selected, value]);
        }
    };

    // Format price for display
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(price);
    };

    const FiltersContent = () => (
        <div className="space-y-4">
            {/* Header with Clear All */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <FiFilter className="text-gray-600 dark:text-gray-400" />
                    <span className="font-bold text-gray-900 dark:text-white">Filters</span>
                    {activeFilterCount > 0 && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-blue-600 text-white rounded-full">
                            {activeFilterCount}
                        </span>
                    )}
                </div>
                {activeFilterCount > 0 && (
                    <button
                        onClick={clearAllFilters}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                    >
                        <FiX size={14} /> Clear All
                    </button>
                )}
            </div>

            {/* Price Range */}
            <FilterAccordion title="Price" count={priceRange[0] > 0 || priceRange[1] < priceBounds.max ? 1 : 0}>
                <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">{formatPrice(priceRange[0])}</span>
                        <span className="text-gray-600 dark:text-gray-400">{formatPrice(priceRange[1])}</span>
                    </div>
                    <div className="relative">
                        <input
                            type="range"
                            min={0}
                            max={priceBounds.max}
                            step={1000}
                            value={priceRange[1]}
                            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Min</label>
                            <input
                                type="number"
                                value={priceRange[0]}
                                onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Max</label>
                            <input
                                type="number"
                                value={priceRange[1]}
                                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 dark:text-white"
                            />
                        </div>
                    </div>
                </div>
            </FilterAccordion>

            {/* Brand Filter */}
            {filterOptions.brands.length > 0 && (
                <FilterAccordion title="Brand" count={selectedBrands.length}>
                    <div className="space-y-1">
                        {filterOptions.brands.map(({ value, count }) => (
                            <FilterCheckbox
                                key={value}
                                label={value}
                                count={count}
                                checked={selectedBrands.includes(value)}
                                onChange={() => toggleFilter(value, selectedBrands, setSelectedBrands)}
                            />
                        ))}
                    </div>
                </FilterAccordion>
            )}

            {/* Processor Filter */}
            {filterOptions.processors.length > 0 && (
                <FilterAccordion title="Processor" count={selectedProcessors.length} defaultOpen={false}>
                    <div className="space-y-1">
                        {filterOptions.processors.map(({ value, count }) => (
                            <FilterCheckbox
                                key={value}
                                label={value}
                                count={count}
                                checked={selectedProcessors.includes(value)}
                                onChange={() => toggleFilter(value, selectedProcessors, setSelectedProcessors)}
                            />
                        ))}
                    </div>
                </FilterAccordion>
            )}

            {/* RAM Filter */}
            {filterOptions.ram.length > 0 && (
                <FilterAccordion title="RAM" count={selectedRAM.length} defaultOpen={false}>
                    <div className="space-y-1">
                        {filterOptions.ram.map(({ value, count }) => (
                            <FilterCheckbox
                                key={value}
                                label={value}
                                count={count}
                                checked={selectedRAM.includes(value)}
                                onChange={() => toggleFilter(value, selectedRAM, setSelectedRAM)}
                            />
                        ))}
                    </div>
                </FilterAccordion>
            )}

            {/* Storage Filter */}
            {filterOptions.storage.length > 0 && (
                <FilterAccordion title="Storage" count={selectedStorage.length} defaultOpen={false}>
                    <div className="space-y-1">
                        {filterOptions.storage.map(({ value, count }) => (
                            <FilterCheckbox
                                key={value}
                                label={value}
                                count={count}
                                checked={selectedStorage.includes(value)}
                                onChange={() => toggleFilter(value, selectedStorage, setSelectedStorage)}
                            />
                        ))}
                    </div>
                </FilterAccordion>
            )}

            {/* Display Size Filter */}
            {filterOptions.displaySizes.length > 0 && (
                <FilterAccordion title="Display Size" count={selectedDisplaySizes.length} defaultOpen={false}>
                    <div className="space-y-1">
                        {filterOptions.displaySizes.map(({ value, count }) => (
                            <FilterCheckbox
                                key={value}
                                label={value}
                                count={count}
                                checked={selectedDisplaySizes.includes(value)}
                                onChange={() => toggleFilter(value, selectedDisplaySizes, setSelectedDisplaySizes)}
                            />
                        ))}
                    </div>
                </FilterAccordion>
            )}

            {/* Operating System Filter */}
            {filterOptions.os.length > 0 && (
                <FilterAccordion title="Operating System" count={selectedOS.length} defaultOpen={false}>
                    <div className="space-y-1">
                        {filterOptions.os.map(({ value, count }) => (
                            <FilterCheckbox
                                key={value}
                                label={value}
                                count={count}
                                checked={selectedOS.includes(value)}
                                onChange={() => toggleFilter(value, selectedOS, setSelectedOS)}
                            />
                        ))}
                    </div>
                </FilterAccordion>
            )}

            {/* Graphics Filter */}
            {filterOptions.graphics.length > 0 && (
                <FilterAccordion title="Graphics" count={selectedGraphics.length} defaultOpen={false}>
                    <div className="space-y-1">
                        {filterOptions.graphics.map(({ value, count }) => (
                            <FilterCheckbox
                                key={value}
                                label={value}
                                count={count}
                                checked={selectedGraphics.includes(value)}
                                onChange={() => toggleFilter(value, selectedGraphics, setSelectedGraphics)}
                            />
                        ))}
                    </div>
                </FilterAccordion>
            )}
        </div>
    );

    // Mobile mode - only render floating button and drawer
    if (mode === 'mobile') {
        return (
            <>
                {/* Mobile Filter Button - Fixed at bottom right */}
                <button
                    onClick={() => setShowMobileFilters(true)}
                    className="fixed bottom-4 right-4 z-40 flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                >
                    <FiFilter />
                    <span className="font-medium">Filters</span>
                    {activeFilterCount > 0 && (
                        <span className="px-2 py-0.5 text-xs bg-white text-blue-600 rounded-full font-bold">
                            {activeFilterCount}
                        </span>
                    )}
                </button>

                {/* Mobile Filter Drawer */}
                {showMobileFilters && (
                    <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setShowMobileFilters(false)}>
                        <div
                            className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-white dark:bg-gray-900 shadow-xl overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between z-10">
                                <span className="font-bold text-gray-900 dark:text-white">Filters</span>
                                <button
                                    onClick={() => setShowMobileFilters(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                                >
                                    <FiX size={20} />
                                </button>
                            </div>
                            <div className="p-4">
                                <FiltersContent />
                            </div>
                            <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4">
                                <button
                                    onClick={() => setShowMobileFilters(false)}
                                    className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Custom Scrollbar Styles */}
                <style jsx global>{`
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: #d1d5db;
                        border-radius: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: #9ca3af;
                    }
                    .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: #4b5563;
                    }
                    .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: #6b7280;
                    }
                `}</style>
            </>
        );
    }

    // Sidebar mode - render filter content directly (for desktop sidebar)
    return (
        <>
            <FiltersContent />

            {/* Custom Scrollbar Styles */}
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #d1d5db;
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #9ca3af;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #4b5563;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #6b7280;
                }
            `}</style>
        </>
    );
}
