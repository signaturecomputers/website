'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface CategoryData {
    id: string;
    name: string;
    description?: string;
    image?: string;
    parentId?: string | null;
    isCustom?: boolean;
    deleted?: boolean;
}

const defaultCategories = [
    {
        id: 'laptops',
        title: 'Laptops',
        description: 'High-performance laptops for all needs',
        link: '/products?category=laptops',
        image: '/images/categories/laptops.jpg',
    },
    {
        id: 'desktops',
        title: 'Desktops',
        description: 'Custom-built and branded desktops',
        link: '/products?category=desktops',
        image: '/images/categories/desktops.jpg',
    },
    {
        id: 'workstations',
        title: 'Workstations',
        description: 'Power-house rigs for professionals',
        link: '/products?category=workstations',
        image: '/images/categories/workstations.jpg',
    },
    {
        id: 'monitors',
        title: 'Monitors',
        description: 'Crisp displays for work and gaming',
        link: '/products?category=monitors',
        image: '/images/categories/monitors.jpg',
    },
    {
        id: 'printers',
        title: 'Printers',
        description: 'Reliable printing solutions',
        link: '/products?category=printers',
        image: '/images/categories/printers.jpg',
    },
    {
        id: 'accessories',
        title: 'Accessories',
        description: 'Keyboards, mice, and more',
        link: '/products?category=accessories',
        image: '/images/categories/accessories.png',
    },
    {
        id: 'cctv',
        title: 'CCTV',
        description: 'Advanced security systems',
        link: '/products?category=cctv',
        image: '/images/categories/cctv.jpg',
    },
];

export default function CategorySection() {
    const [categoryMetadata, setCategoryMetadata] = useState<Record<string, CategoryData>>({});
    const [customCategories, setCustomCategories] = useState<CategoryData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch category metadata (custom images/descriptions)
            const metadataSnapshot = await getDocs(collection(db, 'category_metadata'));
            const metadata: Record<string, CategoryData> = {};
            metadataSnapshot.docs.forEach(doc => {
                metadata[doc.id] = { id: doc.id, ...doc.data() } as CategoryData;
            });
            setCategoryMetadata(metadata);

            // Fetch custom main categories (no parentId)
            const customCatsSnapshot = await getDocs(collection(db, 'custom_categories'));
            const customs = customCatsSnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() } as CategoryData))
                .filter(c => !c.parentId); // Only main categories
            setCustomCategories(customs);
        } catch (error) {
            console.error('Failed to fetch category data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Merge default categories with dynamic metadata, filter out deleted ones
    const categories = defaultCategories
        .filter(cat => {
            const metadata = categoryMetadata[cat.id];
            return metadata?.deleted !== true; // Filter out deleted categories
        })
        .map(cat => {
            const metadata = categoryMetadata[cat.id];
            return {
                ...cat,
                title: metadata?.name || cat.title, // Use custom name if set
                description: metadata?.description || cat.description,
                image: metadata?.image || cat.image,
            };
        });

    // Add custom main categories (filter out deleted ones)
    const allCategories = [
        ...categories,
        ...customCategories
            .filter(cat => !cat.deleted)
            .map(cat => ({
                id: cat.id,
                title: cat.name,
                description: cat.description || '',
                link: `/products?category=${cat.id}`,
                image: cat.image || '',
                isCustom: true,
            })),
    ];

    return (
        <section className="py-16 bg-gray-50/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Products</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {allCategories.map((category) => (
                        <Link key={category.id} href={category.link} className="group block">
                            <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                                {/* Image Area */}
                                <div className="h-48 bg-gray-100 w-full flex items-center justify-center relative overflow-hidden">
                                    {category.image ? (
                                        category.image.startsWith('http') ? (
                                            // Firebase Storage URL
                                            <img
                                                src={category.image}
                                                alt={category.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                            />
                                        ) : (
                                            // Local image
                                            <Image
                                                src={category.image}
                                                alt={category.title}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-300"
                                            />
                                        )
                                    ) : (
                                        <div className="text-gray-400/20 font-bold text-4xl transform -rotate-12 group-hover:scale-110 transition-transform select-none">
                                            {category.title}
                                        </div>
                                    )}
                                </div>

                                {/* Text Area */}
                                <div className="p-6 flex-1">
                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                        {category.title}
                                    </h3>
                                    <p className="mt-2 text-sm text-gray-500">
                                        {category.description}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
