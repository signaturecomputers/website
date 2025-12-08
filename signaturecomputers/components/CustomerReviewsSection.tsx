'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { FiChevronLeft, FiChevronRight, FiStar } from 'react-icons/fi';

// MOCK DATA: 15 Realistic Reviews
const REVIEWS = [
    { id: 1, name: "Arjun Verma", role: "IT Manager", product: "HP EliteBook 840 G8", image: "/hero-image-new.png", rating: 5, text: "We procured 50 units for our sales team. The battery life is phenomenal, and the performance handling heavy CRM software is smooth. Signature Computers delivered on time with excellent packaging." },
    { id: 2, name: "Sneha Reddy", role: "Graphic Designer", product: "HP ZBook Firefly", image: "/hero-image-new.png", rating: 5, text: "Finally found a workstation that handles 4K rendering without heating up. The color accuracy on the display is exactly what I needed for my design work. Highly recommended!" },
    { id: 3, name: "Rajesh Kumar", role: "Small Business Owner", product: "HP ProDesk 400", image: "/hero-image-new.png", rating: 4, text: "Great value for money for office desktops. Compact form factor saved us a lot of desk space. One unit had a minor scratch, but support replaced it immediately." },
    { id: 4, name: "Meera Iyer", role: "Freelancer", product: "HP Envy 13", image: "/hero-image-new.png", rating: 5, text: "Sleek, lightweight, and powerful. I travel a lot, and this laptop is perfect. The keyboard travel is just right for long typing sessions. Love the premium build quality." },
    { id: 5, name: "Vikram Singh", role: "CTO", product: "HPE ProLiant Server", image: "/hero-image-new.png", rating: 5, text: "Setting up our local server with Signature Computers was a breeze. They guided us on the exact specs needed for our workload. The server has been running 24/7 with zero downtime." },
    { id: 6, name: "Ananya Gupta", role: "Student", product: "HP Pavilion 15", image: "/hero-image-new.png", rating: 4, text: "Perfect for college assignments and light gaming. The screen is bright and clear. Delivery was super fast, got it the very next day!" },
    { id: 7, name: "Karthik Nair", role: "Software Engineer", product: "HP Omen 16", image: "/hero-image-new.png", rating: 5, text: "Beast of a machine! Compiles my code in seconds and handles AAA games easily. The cooling system is impressive. Best purchase I've made this year." },
    { id: 8, name: "Priya Sharma", role: "Architect", product: "HP DesignJet Plotter", image: "/hero-image-new.png", rating: 5, text: "Crucial for our architectural prints. The line precision is unmatched. Signature Computers handled the installation and provided a great demo for our team." },
    { id: 9, name: "Amit Patel", role: "Retail Store Owner", product: "HP POS System", image: "/hero-image-new.png", rating: 5, text: "Transformed our checkout process. It's fast, responsive, and looks professional on the counter. Inventory management has become so much easier." },
    { id: 10, name: "Zoya Khan", role: "Content Creator", product: "HP Spectre x360", image: "/hero-image-new.png", rating: 5, text: "The versatility of the 2-in-1 is a game changer for editing on the go. The pen response is instant. Fits perfectly in my tote bag. Premium feel throughout." },
    { id: 11, name: "Rahul Deshmukh", role: "Operations Head", product: "CCTV Security Setup", image: "/hero-image-new.png", rating: 4, text: "Installed 16 cameras across our warehouse. The night vision clarity is excellent. The app integration works well for remote monitoring." },
    { id: 12, name: "Sara Thomas", role: "HR Executive", product: "HP All-in-One", image: "/hero-image-new.png", rating: 5, text: "Such a clean setup! No messy wires. The camera pop-up feature is great for privacy. Screen size is perfect for split-screen multitasking." },
    { id: 13, name: "David Fernandez", role: "Music Producer", product: "HP Workstation Z2", image: "/hero-image-new.png", rating: 5, text: "Handles my heavy DAW projects with tons of plugins effortlessly. Extremely quiet even under load, which is critical for my recording studio environment." },
    { id: 14, name: "Lakshmi Narayanan", role: "School Principal", product: "HP ChromeBook x360", image: "/hero-image-new.png", rating: 4, text: "We bought these for our digital library. Very durable and easy for students to use. Battery lasts the entire school day without charging." },
    { id: 15, name: "Oman Al-Fayed", role: "Procurement Officer", product: "Bulk Accessories", image: "/hero-image-new.png", rating: 5, text: "Ordered keyboards, mice, and headsets in bulk. Corporate pricing was competitive, and everything arrived well-packaged. Will definitely reorder." }
];

export default function CustomerReviewsSection() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [itemsPerScreen, setItemsPerScreen] = useState(3);
    const [isPaused, setIsPaused] = useState(false);

    // Responsive items per screen
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) setItemsPerScreen(1);
            else if (window.innerWidth < 1024) setItemsPerScreen(2);
            else setItemsPerScreen(3);
        };
        handleResize(); // Init
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Auto-rotation
    useEffect(() => {
        if (isPaused) return;
        const interval = setInterval(() => {
            nextSlide();
        }, 4000); // 4 seconds per slide
        return () => clearInterval(interval);
    }, [isPaused, currentIndex, itemsPerScreen]);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % REVIEWS.length);
    }, []);

    const prevSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + REVIEWS.length) % REVIEWS.length);
    }, []);

    // Visible Items Logic (Circular Buffer simplified for sticking to index)
    // We want to show 'itemsPerScreen' starting from 'currentIndex'
    // To handle wrapping smoothly, we can render a subset or translate a long strip.
    // For this carousel, let's use a translation approach for smoothness (optional) 
    // OR a simpler "slice" approach. Given "Loop continuously", translation is better.
    // But for simplicity and robustness in React state without complex animation libraries:
    // We will compute the visible indices.

    const getVisibleReview = (offset: number) => {
        return REVIEWS[(currentIndex + offset) % REVIEWS.length];
    };

    return (
        <section className="relative bg-gray-50 py-16 overflow-hidden">
            {/* ALIGNMENT: Matches Hero/About max-width */}
            <div className="w-full">
                <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">

                    {/* Header */}
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
                            What Our Customers Say
                        </h2>
                        <p className="max-w-2xl mx-auto text-lg text-gray-600">
                            Trusted by businesses and individuals across the region.
                        </p>
                    </div>

                    {/* Carousel Container */}
                    <div
                        className="relative"
                        onMouseEnter={() => setIsPaused(true)}
                        onMouseLeave={() => setIsPaused(false)}
                    >
                        {/* Navigation Buttons (Absolute) */}
                        <button
                            onClick={prevSlide}
                            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-12 z-10 p-2 rounded-full bg-white shadow-lg text-gray-700 hover:text-blue-600 border border-gray-100 transition-all focus:outline-none hidden md:block"
                            aria-label="Previous Review"
                        >
                            <FiChevronLeft size={24} />
                        </button>

                        <button
                            onClick={nextSlide}
                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-12 z-10 p-2 rounded-full bg-white shadow-lg text-gray-700 hover:text-blue-600 border border-gray-100 transition-all focus:outline-none hidden md:block"
                            aria-label="Next Review"
                        >
                            <FiChevronRight size={24} />
                        </button>

                        {/* Valid Content Area */}
                        <div className="overflow-hidden px-1">
                            <div className="flex gap-6 transition-all duration-500 ease-in-out">
                                {/* We render 'itemsPerScreen' Items */}
                                {Array.from({ length: itemsPerScreen }).map((_, idx) => {
                                    const review = getVisibleReview(idx);
                                    return (
                                        <div
                                            key={`${review.id}-${idx}`}
                                            className="flex-1 min-w-0" // Flex hack for equal width
                                        >
                                            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 h-full flex flex-col hover:shadow-md transition-shadow">

                                                {/* Header: User & Rating */}
                                                <div className="flex items-start justify-between mb-6">
                                                    <div className="flex items-center gap-3">
                                                        {/* Initials Avatar if image fails or just style choice */}
                                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                                                            {review.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-gray-900 text-sm leading-tight">{review.name}</h4>
                                                            <p className="text-xs text-gray-500">{review.role}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-0.5">
                                                        {Array.from({ length: 5 }).map((_, i) => (
                                                            <FiStar
                                                                key={i}
                                                                className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Review Text */}
                                                <div className="flex-grow mb-6">
                                                    <p className="text-gray-600 italic text-sm leading-relaxed">
                                                        "{review.text}"
                                                    </p>
                                                </div>

                                                {/* Product Reference */}
                                                <div className="pt-4 border-t border-gray-50 flex items-center gap-3 mt-auto">
                                                    <div className="relative w-10 h-10 rounded-md overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                                                        <Image
                                                            src={review.image}
                                                            alt={review.product}
                                                            fill
                                                            className="object-contain p-1"
                                                        />
                                                    </div>
                                                    <span className="text-xs font-medium text-gray-500 truncate">
                                                        Purchased: <span className="text-blue-600">{review.product}</span>
                                                    </span>
                                                </div>

                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Mobile Swipe Indicators (Dots) */}
                        <div className="flex justify-center gap-2 mt-8 md:hidden">
                            {REVIEWS.slice(0, 5).map((_, i) => ( // Show max 5 dots for sanity
                                <button
                                    key={i}
                                    className={`w-2 h-2 rounded-full transition-all ${i === currentIndex % 5 ? 'bg-blue-600 w-4' : 'bg-gray-300'
                                        }`}
                                    onClick={() => setCurrentIndex(i)}
                                />
                            ))}
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}
