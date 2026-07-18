'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FiClock, FiUsers, FiAward } from 'react-icons/fi';
import { doc, getDoc, collection, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface AboutImageData {
    imageUrl: string;
    alt: string;
}

export default function AboutSection() {
    const [aboutImage, setAboutImage] = useState<AboutImageData>({
        imageUrl: '/about-us-workspace.png',
        alt: 'Professional IT Workspace - Signature Computers'
    });

    useEffect(() => {
        async function fetchAboutImage() {
            try {
                const aboutDoc = await getDoc(doc(db, 'header_settings', 'about_image'));
                if (aboutDoc.exists()) {
                    const data = aboutDoc.data() as AboutImageData;
                    if (data.imageUrl) {
                        setAboutImage(data);
                    }
                }
            } catch (error) {
                console.warn('Failed to fetch about image, using default:', error);
            }
        }
        fetchAboutImage();
    }, []);

    // Happy Customers calculation: Base 5000 + (every 50 users = +1000)
    const [happyCustomers, setHappyCustomers] = useState(5000);

    useEffect(() => {
        async function fetchUserCount() {
            try {
                const usersRef = collection(db, 'users');
                const snapshot = await getCountFromServer(usersRef);
                const userCount = snapshot.data().count;
                // Calculate: base 5000 + (floor(users/50) * 1000)
                const calculatedCustomers = 5000 + Math.floor(userCount / 50) * 1000;
                setHappyCustomers(calculatedCustomers);
            } catch (error) {
                console.warn('Failed to fetch user count, using default:', error);
            }
        }
        fetchUserCount();
    }, []);

    // Calculate years of experience from company start date (April 20, 2022)
    const companyStartDate = new Date(2022, 3, 20); // Month is 0-indexed, so 3 = April
    const today = new Date();
    const yearsOfExperience = Math.floor(
        (today.getTime() - companyStartDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
    );

    return (
        // REMOVED: overflow-hidden to prevent cutting off left-shifted text if screen is tight
        <section id="about-us" className="relative bg-white py-8 scroll-mt-24">
            <div className="w-full">
                <div className="relative z-10 bg-white">
                    <div className="w-full px-4 sm:px-8 lg:px-12">

                        {/* Main Content Row: 53/40 Split
                            - justify-between
                        */}
                        <div className="flex flex-col lg:flex-row items-center justify-between font-sans gap-8 lg:gap-12">

                            {/* LEFT: Text Content 
                                - lg:w-[48%]: Visual split close to 50/50
                                - lg:pl-10: Increased left padding slightly
                                - pr-6: Maintained padding for safety
                            */}
                            <div className="flex-1 lg:flex-none lg:w-[48%] z-20 px-0 lg:pl-10 pr-6">
                                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-6 text-left">
                                    About Us
                                </h2>

                                <div className="space-y-4 text-base sm:text-lg text-gray-600 leading-relaxed text-justify">
                                    <p>
                                        Signature Computers is an Authorized HP Distributor and HP Business Partner, providing genuine, manufacturer-backed IT products to businesses and individual customers through authorized supply channels.
                                    </p>
                                    <p>
                                        Our partnerships with HP, HP Amplify, Hewlett Packard Enterprise (HPE), and HP Poly enable us to deliver reliable, enterprise-grade computing and communication solutions aligned with official brand standards.
                                    </p>
                                    <p>
                                        We specialize in the supply of laptops, desktops, workstations, monitors, memory, storage, and accessories, supporting commercial offices and professional environments.
                                    </p>
                                    <p>
                                        For bulk orders, special configurations, or customized requirements, customers are encouraged to contact us directly for coordinated assistance.
                                    </p>
                                    <div className="pt-4 text-left">
                                        <Link href="/about" className="inline-block px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-colors shadow-sm">
                                            Read More
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT: Image Content 
                                - lg:w-[46%]: Reduced image size slightly to balance visual weight
                                - max-w-md: Prevents the image from dominating on wide screens
                            */}
                            <div className="flex-1 lg:flex-none lg:w-[46%] w-full relative flex items-center justify-center mt-6 lg:mt-0">
                                <div className="relative w-full max-w-md xl:max-w-lg 2xl:max-w-xl aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border border-gray-100 bg-gray-50">
                                    <Image
                                        src={aboutImage.imageUrl}
                                        alt={aboutImage.alt}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </div>

                        </div>

                        {/* STATS STRIP - Integrated */}
                        <div className="mt-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                                <div className="flex flex-col items-center justify-center">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-50">
                                            <FiAward className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">{yearsOfExperience}+ Years</h3>
                                    </div>
                                    <p className="text-sm text-gray-500">Experience</p>
                                </div>
                                <div className="flex flex-col items-center justify-center">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-50">
                                            <FiUsers className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">{happyCustomers.toLocaleString()}+</h3>
                                    </div>
                                    <p className="text-sm text-gray-500">Happy Customers</p>
                                </div>
                                <div className="flex flex-col items-center justify-center">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-50">
                                            <FiClock className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">10:00 AM – 7:00 PM</h3>
                                    </div>
                                    <p className="text-sm text-gray-500">Support Hours</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}
