'use client';

import Link from 'next/link';

const categories = [
    {
        id: 1,
        title: 'Laptops',
        description: 'High-performance laptops for all needs',
        link: '/products?category=laptops',
        imageBg: 'bg-gray-100',
    },
    {
        id: 2,
        title: 'Desktops',
        description: 'Custom-built and branded desktops',
        link: '/products?category=desktops',
        imageBg: 'bg-gray-200',
    },
    {
        id: 3,
        title: 'Workstations',
        description: 'Power-house rigs for professionals',
        link: '/products?category=workstations',
        imageBg: 'bg-gray-300',
    },
    {
        id: 4,
        title: 'Monitors',
        description: 'Crisp displays for work and gaming',
        link: '/products?category=monitors',
        imageBg: 'bg-gray-100',
    },
    {
        id: 5,
        title: 'Printers',
        description: 'Reliable printing solutions',
        link: '/products?category=printers',
        imageBg: 'bg-gray-200',
    },
    {
        id: 6,
        title: 'Accessories',
        description: 'Keyboards, mice, and more',
        link: '/products?category=accessories',
        imageBg: 'bg-gray-300',
    },
    {
        id: 7,
        title: 'CCTV',
        description: 'Advanced security systems',
        link: '/products?category=cctv',
        imageBg: 'bg-gray-100',
    },
];

export default function CategorySection() {
    return (
        <section className="py-16 bg-gray-50/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Products</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {categories.map((category) => (
                        <Link key={category.id} href={category.link} className="group block">
                            <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                                {/* Image Area */}
                                <div className={`h-48 ${category.imageBg} w-full flex items-center justify-center relative overflow-hidden`}>
                                    {/* Placeholder visual - using text for now as images aren't provided */}
                                    <div className="text-gray-400/20 font-bold text-4xl transform -rotate-12 group-hover:scale-110 transition-transform select-none">
                                        {category.title}
                                    </div>
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
