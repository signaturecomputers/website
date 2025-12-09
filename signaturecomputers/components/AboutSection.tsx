'use client';

import Image from 'next/image';
import { FiClock, FiUsers, FiAward } from 'react-icons/fi';

export default function AboutSection() {
    return (
        // REMOVED: overflow-hidden to prevent cutting off left-shifted text if screen is tight
        <section id="about-us" className="relative bg-white py-8 scroll-mt-24">
            <div className="w-full">
                <div className="relative z-10 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">

                        {/* Main Content Row: 53/40 Split
                            - justify-between
                        */}
                        <div className="flex flex-col lg:flex-row items-start justify-between font-sans">

                            {/* LEFT: Text Content 
                                - lg:w-[53%]: Slightly reduced to ensure no "hiding" near image
                                - lg:-ml-12: Shifted "little more left" (Increased from -ml-8)
                                - pr-6: Maintained padding for safety
                            */}
                            <div className="flex-1 lg:flex-none lg:w-[53%] z-20 px-0 lg:-ml-12 pr-6">
                                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4 text-left">
                                    About Us
                                </h2>

                                <div className="space-y-3 text-base sm:text-lg text-gray-600 leading-relaxed text-justify">
                                    <p>
                                        Signature Computers is an Authorized HP Distributor and HP Business Partner, providing genuine, manufacturer-backed IT products to businesses and individual customers through authorized supply channels.
                                    </p>
                                    <p>
                                        Our partnerships with HP, HP Amplify, Hewlett Packard Enterprise (HPE), and HP Poly enable us to deliver reliable, enterprise-grade computing and communication solutions aligned with official brand standards.
                                    </p>
                                    <p>
                                        We specialize in the supply of laptops, desktops, workstations, monitors, printers, accessories, and CCTV solutions, supporting commercial offices and professional environments.
                                    </p>
                                    <p>
                                        For bulk orders, special configurations, or customized requirements, customers are encouraged to contact us directly for coordinated assistance.
                                    </p>
                                </div>
                            </div>

                            {/* RIGHT: Image Content 
                                - lg:w-[40%]
                                - lg:ml-auto: Pushed to right
                                - lg:mt-8: Kept vertical alignment
                            */}
                            <div className="flex-1 lg:flex-none lg:w-[40%] lg:ml-auto w-full relative flex items-start justify-center lg:justify-start mt-6 lg:mt-8">
                                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                                    <Image
                                        src="/about-us-workspace.png"
                                        alt="Professional IT Workspace - Signature Computers"
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
                                        <h3 className="text-lg font-bold text-gray-900">4+ Years</h3>
                                    </div>
                                    <p className="text-sm text-gray-500">Experience</p>
                                </div>
                                <div className="flex flex-col items-center justify-center">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-50">
                                            <FiUsers className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">5000+</h3>
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
