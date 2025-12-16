'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
    Keyboard,
    Mouse,
    Headphones,
    Cable,
    BatteryCharging,
    Briefcase,
    Usb,
    Disc,
    Monitor,
    Grid3X3
} from 'lucide-react';

const subcategories = [
    {
        id: 'keyboards',
        title: 'Keyboards',
        description: 'Mechanical and membrane keyboards',
        link: '/products?category=keyboards',
        icon: Keyboard,
        color: 'from-green-500 to-emerald-600',
        image: '/images/subcategories/keyboards.jpg',
    },
    {
        id: 'mouse',
        title: 'Mouse',
        description: 'Wired and wireless mouse',
        link: '/products?category=mouse',
        icon: Mouse,
        color: 'from-blue-500 to-indigo-600',
        image: '/images/subcategories/mouse.jpg',
    },
    {
        id: 'keyboard-mouse-combo',
        title: 'Keyboard & Mouse Combo',
        description: 'Complete keyboard and mouse sets',
        link: '/products?category=keyboard-mouse-combo',
        icon: Grid3X3,
        color: 'from-purple-500 to-violet-600',
        image: '/images/subcategories/keyboard-mouse-combo.jpg',
    },
    {
        id: 'headphones',
        title: 'Headphones',
        description: 'Headsets and earphones',
        link: '/products?category=headphones',
        icon: Headphones,
        color: 'from-pink-500 to-rose-600',
        image: '/images/subcategories/headphones.jpg',
    },
    {
        id: 'cables',
        title: 'Cables',
        description: 'HDMI, DP, VGA, and RJ45 connector',
        link: '/products?category=cables',
        icon: Cable,
        color: 'from-gray-500 to-slate-600',
        image: '/images/subcategories/cables.jpg',
    },
    {
        id: 'power-adapters',
        title: 'Power Adapters',
        description: 'Chargers and power supplies',
        link: '/products?category=power-adapters',
        icon: BatteryCharging,
        color: 'from-yellow-500 to-orange-600',
        image: '/images/subcategories/power-adapters.jpg',
    },
    {
        id: 'bags',
        title: 'Bags',
        description: 'Laptop bags and backpacks',
        link: '/products?category=bags',
        icon: Briefcase,
        color: 'from-amber-500 to-yellow-600',
        image: '/images/subcategories/bags.jpg',
    },
    {
        id: 'docks',
        title: 'Docks',
        description: 'USB-C docks and hubs',
        link: '/products?category=docks',
        icon: Monitor,
        color: 'from-cyan-500 to-teal-600',
        image: '/images/subcategories/docks-v3.jpg',
    },
    {
        id: 'usb-flashdrives',
        title: 'USB Flash Drives',
        description: 'Portable storage devices',
        link: '/products?category=usb-flashdrives',
        icon: Usb,
        color: 'from-red-500 to-rose-600',
        image: '/images/subcategories/usb-flashdrives-v4.jpg',
    },
    {
        id: 'dvd-writers',
        title: 'DVD Writers',
        description: 'External optical drives',
        link: '/products?category=dvd-writers',
        icon: Disc,
        color: 'from-indigo-500 to-purple-600',
        image: '/images/subcategories/dvd-writers.jpg',
    },
];

export default function AccessoriesSubcategorySection() {
    return (
        <section className="py-8 bg-gray-50/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Browse Accessories by Category</h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {subcategories.map((subcategory) => {
                        const Icon = subcategory.icon;
                        return (
                            <Link key={subcategory.id} href={subcategory.link} className="group block">
                                <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col border border-gray-100 hover:border-gray-200">
                                    {/* Image/Icon Area */}
                                    <div className={`h-32 ${subcategory.image ? '' : `bg-gradient-to-br ${subcategory.color}`} w-full flex items-center justify-center relative overflow-hidden`}>
                                        {subcategory.image ? (
                                            <Image
                                                src={subcategory.image}
                                                alt={subcategory.title}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-300"
                                            />
                                        ) : (
                                            <Icon className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-300" />
                                        )}
                                    </div>

                                    {/* Text Area */}
                                    <div className="p-4 flex-1">
                                        <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                                            {subcategory.title}
                                        </h3>
                                        <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                                            {subcategory.description}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
