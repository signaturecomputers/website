'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface BrandLogo {
    name: string;
    imageUrl: string;
    order: number;
}

const DEFAULT_BRANDS: BrandLogo[] = [
    { name: 'HP Authorized Distributor', imageUrl: '/brands/hp-authorized.png', order: 0 },
    { name: 'HP Amplify', imageUrl: '/brands/hp-amplify.png', order: 1 },
    { name: 'Hewlett Packard Enterprise', imageUrl: '/brands/hpe.png', order: 2 },
    { name: 'HP Business Partner', imageUrl: '/brands/hp-business-partner.png', order: 3 },
    { name: 'Poly', imageUrl: '/brands/poly.png', order: 4 },
    { name: 'Nvidia', imageUrl: '/brands/nvidia.png', order: 5 },
    { name: 'Seagate', imageUrl: '/brands/seagate.png', order: 6 },
    { name: 'Western Digital', imageUrl: '/brands/wd.png', order: 7 },
    { name: 'AMD', imageUrl: '/brands/amd-updated.png', order: 8 },
    { name: 'Intel', imageUrl: '/brands/intel-logo-final.png', order: 9 },
];

export default function BrandMarquee() {
    const [brands, setBrands] = useState<BrandLogo[]>(DEFAULT_BRANDS);

    useEffect(() => {
        async function fetchBrandLogos() {
            try {
                const brandsDoc = await getDoc(doc(db, 'header_settings', 'brand_logos'));
                if (brandsDoc.exists()) {
                    const data = brandsDoc.data();
                    if (data.logos && data.logos.length > 0) {
                        setBrands(data.logos.sort((a: BrandLogo, b: BrandLogo) => a.order - b.order));
                    }
                }
            } catch (error) {
                console.warn('Failed to fetch brand logos, using defaults:', error);
            }
        }
        fetchBrandLogos();
    }, []);

    return (
        <section className="w-full bg-white border-t border-gray-100 py-10 overflow-hidden">
            <div className="flex w-full">
                {/* 
                  Wrapper for the infinite track 
                  - animate-scroll-pause: defined in globals.css (stepped keyframes)
                  - min-w-max: ensures children define width
                */}
                <div className="flex animate-scroll-pause min-w-max items-center">
                    {/* First Set of Logos */}
                    <div className="flex items-center gap-16 mx-8">
                        {brands.map((brand, idx) => (
                            <div key={`b1-${idx}`} className="relative h-16 w-32 md:w-40 flex-shrink-0 transition-transform hover:scale-105 duration-300">
                                <Image
                                    src={brand.imageUrl}
                                    alt={brand.name}
                                    fill
                                    priority={false}
                                    className="object-contain"
                                />
                            </div>
                        ))}
                    </div>

                    {/* Duplicate Set for Seamless Loop (Target -50% matches end of this set) */}
                    <div className="flex items-center gap-16 mx-8">
                        {brands.map((brand, idx) => (
                            <div key={`b2-${idx}`} className="relative h-16 w-32 md:w-40 flex-shrink-0 transition-transform hover:scale-105 duration-300">
                                <Image
                                    src={brand.imageUrl}
                                    alt={brand.name}
                                    fill
                                    priority={false}
                                    className="object-contain"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
