'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
    FiMonitor,
    FiPrinter,
    FiHeadphones,
    FiHardDrive,
    FiPackage,
    FiGrid
} from 'react-icons/fi';
import {
    Laptop,
    Monitor,
    Printer,
    Keyboard,
    Mouse,
    Headphones,
    Cable,
    BatteryCharging,
    Briefcase,
    Disc,
    Usb,
    Package
} from 'lucide-react';

interface Category {
    id: string;
    name: string;
    group: string | null;
    icon: any;
    color: string;
    count?: number;
}

export default function CategoriesPage() {
    const router = useRouter();
    const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);

    const categories: Category[] = [
        // Main categories
        { id: 'laptops', name: 'Laptops', group: null, icon: Laptop, color: 'blue' },
        { id: 'desktops', name: 'Desktops', group: null, icon: Monitor, color: 'purple' },
        { id: 'monitors', name: 'Monitors', group: null, icon: FiMonitor, color: 'indigo' },
        // Printers group
        { id: 'printers', name: 'Printers', group: 'Printers', icon: Printer, color: 'orange' },
        { id: 'toners', name: 'Toners', group: 'Printers', icon: Package, color: 'amber' },
        { id: 'cartridges', name: 'Cartridges', group: 'Printers', icon: FiPackage, color: 'yellow' },
        // Accessories group
        { id: 'keyboards', name: 'Keyboards', group: 'Accessories', icon: Keyboard, color: 'green' },
        { id: 'mouse', name: 'Mouse', group: 'Accessories', icon: Mouse, color: 'teal' },
        { id: 'keyboard-mouse-combo', name: 'Keyboard & Mouse Combo', group: 'Accessories', icon: FiGrid, color: 'cyan' },
        { id: 'headphones', name: 'Headphones', group: 'Accessories', icon: Headphones, color: 'sky' },
        { id: 'cables', name: 'Cables', group: 'Accessories', icon: Cable, color: 'slate' },
        { id: 'power-adapters', name: 'Power Adapters', group: 'Accessories', icon: BatteryCharging, color: 'lime' },
        { id: 'bags', name: 'Bags', group: 'Accessories', icon: Briefcase, color: 'rose' },
        { id: 'docks', name: 'Docks', group: 'Accessories', icon: FiHardDrive, color: 'fuchsia' },
        { id: 'usb-flashdrives', name: 'USB Flash Drives', group: 'Accessories', icon: Usb, color: 'violet' },
        { id: 'dvd-writers', name: 'DVD Writers', group: 'Accessories', icon: Disc, color: 'pink' },
    ];

    useEffect(() => {
        fetchCategoryCounts();
    }, []);

    const fetchCategoryCounts = async () => {
        setLoading(true);
        const counts: Record<string, number> = {};

        try {
            for (const cat of categories) {
                try {
                    const snapshot = await getDocs(collection(db, cat.id));
                    counts[cat.id] = snapshot.docs.length;
                } catch {
                    counts[cat.id] = 0;
                }
            }
            setCategoryCounts(counts);
        } catch (error) {
            console.error('Failed to fetch category counts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryClick = (categoryId: string) => {
        // Navigate to products page with category filter
        router.push(`/admindashboard/products?category=${categoryId}`);
    };

    const getColorClasses = (color: string) => {
        const colorMap: Record<string, { bg: string; text: string; border: string; iconBg: string }> = {
            blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800', iconBg: 'bg-blue-100 dark:bg-blue-900/40' },
            purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800', iconBg: 'bg-purple-100 dark:bg-purple-900/40' },
            indigo: { bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-800', iconBg: 'bg-indigo-100 dark:bg-indigo-900/40' },
            orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800', iconBg: 'bg-orange-100 dark:bg-orange-900/40' },
            amber: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800', iconBg: 'bg-amber-100 dark:bg-amber-900/40' },
            yellow: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-800', iconBg: 'bg-yellow-100 dark:bg-yellow-900/40' },
            green: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400', border: 'border-green-200 dark:border-green-800', iconBg: 'bg-green-100 dark:bg-green-900/40' },
            teal: { bg: 'bg-teal-50 dark:bg-teal-900/20', text: 'text-teal-600 dark:text-teal-400', border: 'border-teal-200 dark:border-teal-800', iconBg: 'bg-teal-100 dark:bg-teal-900/40' },
            cyan: { bg: 'bg-cyan-50 dark:bg-cyan-900/20', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-200 dark:border-cyan-800', iconBg: 'bg-cyan-100 dark:bg-cyan-900/40' },
            sky: { bg: 'bg-sky-50 dark:bg-sky-900/20', text: 'text-sky-600 dark:text-sky-400', border: 'border-sky-200 dark:border-sky-800', iconBg: 'bg-sky-100 dark:bg-sky-900/40' },
            slate: { bg: 'bg-slate-50 dark:bg-slate-900/20', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-700', iconBg: 'bg-slate-100 dark:bg-slate-800' },
            lime: { bg: 'bg-lime-50 dark:bg-lime-900/20', text: 'text-lime-600 dark:text-lime-400', border: 'border-lime-200 dark:border-lime-800', iconBg: 'bg-lime-100 dark:bg-lime-900/40' },
            rose: { bg: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-800', iconBg: 'bg-rose-100 dark:bg-rose-900/40' },
            fuchsia: { bg: 'bg-fuchsia-50 dark:bg-fuchsia-900/20', text: 'text-fuchsia-600 dark:text-fuchsia-400', border: 'border-fuchsia-200 dark:border-fuchsia-800', iconBg: 'bg-fuchsia-100 dark:bg-fuchsia-900/40' },
            violet: { bg: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-600 dark:text-violet-400', border: 'border-violet-200 dark:border-violet-800', iconBg: 'bg-violet-100 dark:bg-violet-900/40' },
            pink: { bg: 'bg-pink-50 dark:bg-pink-900/20', text: 'text-pink-600 dark:text-pink-400', border: 'border-pink-200 dark:border-pink-800', iconBg: 'bg-pink-100 dark:bg-pink-900/40' },
        };
        return colorMap[color] || colorMap.blue;
    };

    // Group categories
    const mainCategories = categories.filter(c => c.group === null);
    const printerCategories = categories.filter(c => c.group === 'Printers');
    const accessoryCategories = categories.filter(c => c.group === 'Accessories');

    const renderCategoryCard = (category: Category) => {
        const colors = getColorClasses(category.color);
        const Icon = category.icon;
        const count = categoryCounts[category.id] ?? 0;

        return (
            <div
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`${colors.bg} ${colors.border} border-2 rounded-xl p-6 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200 group`}
            >
                <div className="flex flex-col items-center text-center">
                    {/* Icon */}
                    <div className={`${colors.iconBg} ${colors.text} w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-8 h-8" />
                    </div>

                    {/* Name */}
                    <h3 className={`font-semibold text-gray-900 dark:text-white mb-2`}>
                        {category.name}
                    </h3>

                    {/* Count */}
                    <p className={`${colors.text} text-sm font-medium`}>
                        {loading ? '...' : `${count} products`}
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold dark:text-white">Categories</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Click on a category to view its products
                </p>
            </div>

            {/* Main Categories */}
            <div>
                <h2 className="text-lg font-semibold dark:text-white mb-4">Main Categories</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {mainCategories.map(renderCategoryCard)}
                </div>
            </div>

            {/* Printers */}
            <div>
                <h2 className="text-lg font-semibold dark:text-white mb-4">Printers & Supplies</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {printerCategories.map(renderCategoryCard)}
                </div>
            </div>

            {/* Accessories */}
            <div>
                <h2 className="text-lg font-semibold dark:text-white mb-4">Accessories</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {accessoryCategories.map(renderCategoryCard)}
                </div>
            </div>
        </div>
    );
}
