'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';

export default function SEOContentSection() {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const faqs = [
        {
            question: "Do you provide a warranty on laptops and desktops?",
            answer: "Yes! All our new laptops, desktops, and accessories come with official manufacturer warranties. Warranty periods vary by brand and product category. We also assist with warranty claims for items purchased from Signature Computers."
        },
        {
            question: "Do you deliver across India?",
            answer: "Currently, our primary delivery and service base is in Chennai and across Tamil Nadu for the fastest service. For bulk enterprise orders, we do handle nationwide shipping. Please check our shipping policy or contact support for exact delivery timelines."
        },
        {
            question: "What is your return policy?",
            answer: "We offer a straightforward return policy for defective or completely sealed, unopened products within a specified timeframe. If a product arrives damaged, please report it within 24 hours of delivery. Refer to our Returns & Refunds page for full terms."
        }
    ];

    return (
        <section className="bg-gray-50 py-12 border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 text-gray-700 space-y-12">
                
                {/* Intro Section */}
                <div className="text-center max-w-3xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 tracking-tight">
                        Signature Computers: Your Premium Tech Destination in Chennai
                    </h2>
                    <p className="text-sm md:text-base leading-relaxed text-gray-600">
                        Signature Computers is your trusted source for premium IT hardware and enterprise solutions. 
                        Based in Chennai, we specialize in offering genuine, high-performance computing devices and accessories 
                        from leading global brands like HP. Whether you need an ultrabook for college, a high-end workstation 
                        for your business, or bulk enterprise systems, we bring top-tier tech to your doorstep.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    
                    <div className="space-y-10">
                        {/* Categories Section */}
                        <div className="space-y-4 text-sm leading-relaxed">
                            <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                                Explore Our Elite Product Categories
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Navigate our curated selection of genuine tech hardware engineered for daily productivity and extreme performance.
                            </p>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <li className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between group hover:border-blue-300 transition-colors">
                                    <div>
                                        <h4 className="font-semibold text-gray-900"><Link href="/category/laptops" className="hover:text-blue-600">High-Performance Laptops</Link></h4>
                                        <p className="text-xs text-gray-500 mt-1">Gaming, business, and daily use laptops.</p>
                                    </div>
                                    <span className="text-blue-500 group-hover:translate-x-1 transition-transform">→</span>
                                </li>
                                <li className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between group hover:border-blue-300 transition-colors">
                                    <div>
                                        <h4 className="font-semibold text-gray-900"><Link href="/category/desktops" className="hover:text-blue-600">Powerful Desktops</Link></h4>
                                        <p className="text-xs text-gray-500 mt-1">AIOs, towers, and customized rigs.</p>
                                    </div>
                                    <span className="text-blue-500 group-hover:translate-x-1 transition-transform">→</span>
                                </li>
                                <li className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between group hover:border-blue-300 transition-colors">
                                    <div>
                                        <h4 className="font-semibold text-gray-900"><Link href="/category/accessories" className="hover:text-blue-600">Essential Accessories</Link></h4>
                                        <p className="text-xs text-gray-500 mt-1">Monitors, keyboards, mice, and docks.</p>
                                    </div>
                                    <span className="text-blue-500 group-hover:translate-x-1 transition-transform">→</span>
                                </li>
                                <li className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between group hover:border-blue-300 transition-colors">
                                    <div>
                                        <h4 className="font-semibold text-gray-900"><Link href="/products" className="hover:text-blue-600">Networking & Security</Link></h4>
                                        <p className="text-xs text-gray-500 mt-1">Enterprise routers and security hardware.</p>
                                    </div>
                                    <span className="text-blue-500 group-hover:translate-x-1 transition-transform">→</span>
                                </li>
                            </ul>
                        </div>

                        {/* Why Choose Us */}
                        <div className="space-y-4 text-sm leading-relaxed">
                            <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                                Why Upgrade with Signature Computers?
                            </h3>
                            <ul className="space-y-3 mt-4 text-gray-600">
                                <li className="flex items-start gap-2">
                                    <svg className="w-5 h-5 text-green-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                    <span><strong>100% Genuine Products:</strong> As an Authorized Business Partner, we guarantee the authenticity of every single component.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <svg className="w-5 h-5 text-green-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                    <span><strong>Official Warranty Support:</strong> Shop with peace of mind. Our products are fully backed by national manufacturer warranties.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <svg className="w-5 h-5 text-green-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                    <span><strong>Secure & Fast Delivery:</strong> Highly reliable logistics ensuring your hardware reaches you safely and promptly.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <svg className="w-5 h-5 text-green-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                    <span><strong>Dedicated Customer Support:</strong> Expert purchase advice and reliable post-sales technical assistance.</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* eCommerce FAQs */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                            Frequently Asked Questions
                        </h3>
                        <div className="mt-4 space-y-3">
                            {faqs.map((faq, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg bg-white overflow-hidden">
                                    <button
                                        onClick={() => toggleFaq(index)}
                                        className="w-full flex justify-between items-center p-4 text-left focus:outline-none hover:bg-gray-50 transition-colors"
                                    >
                                        <span className="font-medium text-gray-900 text-sm">{faq.question}</span>
                                        <FiChevronDown 
                                            className={`text-gray-500 transform transition-transform duration-200 ${openFaq === index ? 'rotate-180' : ''}`} 
                                        />
                                    </button>
                                    <div 
                                        className={`px-4 text-sm text-gray-600 transition-all duration-300 ease-in-out ${openFaq === index ? 'max-h-40 pb-4 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
                                    >
                                        <p className="pt-2 border-t border-gray-100">{faq.answer}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
