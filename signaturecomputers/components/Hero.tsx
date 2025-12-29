'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiShoppingCart } from 'react-icons/fi';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface HeroImageData {
    imageUrl: string;
    alt: string;
}

export default function Hero() {
    const [heroImage, setHeroImage] = useState<HeroImageData>({
        imageUrl: '/hero-image-v2.png',
        alt: 'Signature Computers Hero'
    });

    useEffect(() => {
        async function fetchHeroImage() {
            try {
                const heroDoc = await getDoc(doc(db, 'header_settings', 'hero_image'));
                if (heroDoc.exists()) {
                    const data = heroDoc.data() as HeroImageData;
                    if (data.imageUrl) {
                        setHeroImage(data);
                    }
                }
            } catch (error) {
                console.warn('Failed to fetch hero image, using default:', error);
            }
        }
        fetchHeroImage();
    }, []);

    return (
        <div className="relative bg-white overflow-hidden">
            <div className="w-full">

                {/* 
                   Vertical Spacing Adjustment: 
                   Reduced pt-24 -> pt-12/16 and pb-16 -> pb-4 
                   to accommodate the logo strip without growing the total height excessively.
                */}
                <div className="relative z-10 bg-white pb-12 pt-12 lg:pt-16">
                    <main className="w-full px-4 sm:px-8 lg:px-12 flex flex-col lg:flex-row items-center gap-10 lg:gap-0">

                        {/* LEFT: Text Content */}
                        <div className="flex-1 lg:flex-none lg:w-[58%] sm:text-center lg:text-left z-20 pl-0 lg:pl-6 self-center pr-8">
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wide text-blue-700 bg-blue-100 mb-4 uppercase">
                                HP Authorized Distributor and Reseller
                            </span>
                            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl mb-6">
                                Your Complete <br className="hidden lg:block" />
                                <span className="text-blue-600">Computer Solutions</span>
                            </h1>
                            <p className="mt-2 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-2xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0 mb-8 font-light leading-relaxed">
                                From laptops to workstations, printers to CCTV systems – we provide premium technology solutions for homes and businesses.
                            </p>

                            <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start gap-4">
                                <div className="rounded-md shadow">
                                    <Link href="/products" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition-all hover:shadow-lg">
                                        <FiShoppingCart className="mr-2" /> Shop Now
                                    </Link>
                                </div>
                                <div className="mt-3 sm:mt-0 sm:ml-3">
                                    <Link href="/get-quote" className="w-full flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition-colors">
                                        Get Quote
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Image Content */}
                        <div className="flex-1 lg:flex-none lg:w-[42%] w-full relative flex items-start justify-start mt-6 lg:mt-0">
                            <div className="relative w-full max-w-lg lg:max-w-none h-auto">
                                <Image
                                    src={heroImage.imageUrl}
                                    alt={heroImage.alt}
                                    width={800}
                                    height={600}
                                    priority
                                    quality={100}
                                    unoptimized
                                    className="w-full h-auto object-contain object-left"
                                />
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
