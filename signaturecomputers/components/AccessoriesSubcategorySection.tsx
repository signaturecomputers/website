'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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
    Grid3X3,
    Package
} from 'lucide-react';

interface CategoryData {
    id: string;
    name: string;
    description?: string;
    image?: string;
    parentId?: string | null;
    deleted?: boolean;
}

const defaultSubcategories = [
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
        title: 'Others',
        description: 'DVD, Webcams & other accessories',
        link: '/products?category=dvd-writers',
        icon: Disc,
        color: 'from-indigo-500 to-purple-600',
        image: '/images/subcategories/dvd-writers.jpg',
    },
];

export default function AccessoriesSubcategorySection() {
    const [categoryMetadata, setCategoryMetadata] = useState<Record<string, CategoryData>>({});
    const [customSubcategories, setCustomSubcategories] = useState<CategoryData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch category metadata
            const metadataSnapshot = await getDocs(collection(db, 'category_metadata'));
            const metadata: Record<string, CategoryData> = {};
            metadataSnapshot.docs.forEach(doc => {
                metadata[doc.id] = { id: doc.id, ...doc.data() } as CategoryData;
            });
            setCategoryMetadata(metadata);

            // Fetch custom subcategories under accessories
            const customCatsSnapshot = await getDocs(collection(db, 'custom_categories'));
            const customs = customCatsSnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() } as CategoryData))
                .filter(c => c.parentId === 'accessories');
            setCustomSubcategories(customs);
        } catch (error) {
            console.error('Failed to fetch category data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Merge default subcategories with dynamic metadata, filter out deleted ones
    const subcategories = defaultSubcategories
        .filter(sub => {
            const metadata = categoryMetadata[sub.id];
            return metadata?.deleted !== true; // Filter out deleted categories
        })
        .map(sub => {
            const metadata = categoryMetadata[sub.id];
            return {
                ...sub,
                title: metadata?.name || sub.title, // Use custom name if set
                description: metadata?.description || sub.description,
                image: metadata?.image || sub.image,
            };
        });

    // Add custom subcategories (filter out deleted ones)
    const allSubcategories = [
        ...subcategories,
        ...customSubcategories
            .filter(cat => !cat.deleted)
            .map(cat => ({
                id: cat.id,
                title: cat.name,
                description: cat.description || '',
                link: `/products?category=${cat.id}`,
                icon: Package,
                color: 'from-gray-500 to-slate-600',
                image: cat.image || '',
            })),
    ];

    return (
        <section className="py-8 bg-gray-50/50">
            <div className="w-full px-4 sm:px-8 lg:px-12">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Browse Accessories by Category</h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                    {allSubcategories.map((subcategory) => {
                        const Icon = subcategory.icon;
                        const imageUrl = subcategory.image;
                        const isFirebaseUrl = imageUrl?.startsWith('http');

                        return (
                            <Link key={subcategory.id} href={subcategory.link} className="group block">
                                <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col border border-gray-100 hover:border-gray-200">
                                    {/* Image/Icon Area */}
                                    <div className={`aspect-[4/3] ${!imageUrl ? `bg-gradient-to-br ${subcategory.color}` : ''} w-full flex items-center justify-center relative overflow-hidden`}>
                                        {imageUrl ? (
                                            isFirebaseUrl ? (
                                                <img
                                                    src={imageUrl}
                                                    alt={subcategory.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                />
                                            ) : (
                                                <Image
                                                    src={imageUrl}
                                                    alt={subcategory.title}
                                                    fill
                                                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                                                />
                                            )
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
