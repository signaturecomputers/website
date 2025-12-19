'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Printer, Package } from 'lucide-react';

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
        id: 'printers',
        title: 'Printers',
        description: 'Inkjet and laser printers',
        link: '/products?category=printers',
        icon: Printer,
        color: 'from-orange-500 to-amber-600',
        image: '',
    },
    {
        id: 'cartridges',
        title: 'Cartridges',
        description: 'Ink cartridges for all printer brands',
        link: '/products?category=cartridges',
        icon: Package,
        color: 'from-blue-500 to-indigo-600',
        image: '',
    },
    {
        id: 'toners',
        title: 'Toners',
        description: 'Laser printer toners',
        link: '/products?category=toners',
        icon: Package,
        color: 'from-gray-500 to-slate-600',
        image: '',
    },
];

export default function PrinterSubcategorySection() {
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

            // Fetch custom subcategories under printers-group
            const customCatsSnapshot = await getDocs(collection(db, 'custom_categories'));
            const customs = customCatsSnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() } as CategoryData))
                .filter(c => c.parentId === 'printers-group');
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Browse Printers & Supplies</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {allSubcategories.map((subcategory) => {
                        const Icon = subcategory.icon;
                        const imageUrl = subcategory.image;
                        const isFirebaseUrl = imageUrl?.startsWith('http');

                        return (
                            <Link key={subcategory.id} href={subcategory.link} className="group block">
                                <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col border border-gray-100 hover:border-gray-200">
                                    {/* Image/Icon Area */}
                                    <div className={`h-40 ${!imageUrl ? `bg-gradient-to-br ${subcategory.color}` : 'bg-gray-100'} w-full flex items-center justify-center relative overflow-hidden`}>
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
                                            <Icon className="w-12 h-12 text-white group-hover:scale-110 transition-transform duration-300" />
                                        )}
                                    </div>

                                    {/* Text Area */}
                                    <div className="p-5 flex-1">
                                        <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                            {subcategory.title}
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500">
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
