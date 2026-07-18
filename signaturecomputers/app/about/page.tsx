import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { FiClock, FiUsers, FiAward, FiCheckCircle, FiShield, FiMapPin, FiPhone, FiMail } from 'react-icons/fi';
import { adminDb } from '@/lib/firebase-admin';
import { BUSINESS_INFO } from '@/lib/seo-schema';

export const revalidate = 3600; // Revalidate every hour

export const metadata: Metadata = {
    title: 'About Signature Computers | HP Authorized Partner in Egmore, Chennai',
    description: 'Learn about Signature Computers, an authorized HP Partner and Distributor in Egmore, Chennai. Discover our story, years of experience, and why businesses trust us for genuine HP laptops, desktops, and accessories with full warranty.',
    robots: {
        index: true,
        follow: true,
    },
    alternates: {
        canonical: `${BUSINESS_INFO.url}/about`,
    },
};

async function getStats() {
    let userCount = 0;
    try {
        if (adminDb && typeof adminDb.collection === 'function') {
            const snapshot = await adminDb.collection('users').count().get();
            userCount = snapshot.data().count;
        }
    } catch (e) {
        console.warn('Failed to fetch user count from firestore-admin, using default:', e);
    }
    
    // Calculate stats
    const companyStartDate = new Date(2022, 3, 20); // April 20, 2022
    const today = new Date();
    const yearsOfExperience = Math.floor(
        (today.getTime() - companyStartDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
    );
    const happyCustomers = 5000 + Math.floor(userCount / 50) * 1000;

    return {
        yearsOfExperience,
        happyCustomers
    };
}

export default async function AboutPage() {
    const { yearsOfExperience, happyCustomers } = await getStats();

    return (
        <div className="bg-gray-50 dark:bg-black min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 py-24 text-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(120,119,198,0.2),transparent_50%)]" />
                <div className="relative z-10 w-full px-4 sm:px-8 lg:px-12 text-center max-w-4xl mx-auto">
                    <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-white mb-6 leading-tight">
                        About Signature Computers
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
                        Dedicated HP Business Partner in Egmore, Chennai. Delivering authentic, enterprise-grade computing solutions with official manufacturer warranty.
                    </p>
                </div>
            </section>

            {/* Core Story & Image */}
            <section className="w-full px-4 sm:px-8 lg:px-12 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    {/* Left: Expanded Story */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="inline-block px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-full uppercase tracking-wider mb-2">
                            Our Story
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                            Providing Genuine IT Hardware Since 2022
                        </h2>
                        
                        <div className="space-y-4 text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed text-justify">
                            <p>
                                Established on April 20, 2022, <strong>Signature Computers</strong> has established itself as Egmore’s premier retail destination for genuine, high-quality computer hardware. As an official <strong>HP Authorized Partner</strong> and <strong>HP Amplify Business Partner</strong>, our retail showroom is committed to supplying genuine new HP products to individual consumers, corporate clients, and commercial establishments throughout Chennai.
                            </p>
                            <p>
                                We offer a comprehensive selection of brand-new, factory-sealed computing products. Our product catalog features high-performance <strong>Laptops</strong> for business and personal use, sleek commercial <strong>Desktops</strong>, power-house commercial <strong>Workstations</strong> for specialized applications, and professional <strong>Monitors</strong> for vibrant, crystal-clear displays. Every unit is sourced directly through authorized HP channels, ensuring authenticity and full qualification for HP's standard manufacturer warranty.
                            </p>
                            <p>
                                In addition to complete systems, we stock a wide array of original computer components and accessories. This includes <strong>Memory & Storage</strong> upgrades to boost computing speed, dedicated <strong>Graphics Cards</strong>, and essential peripherals. We provide distinct selections of original <strong>Keyboards</strong>, precision <strong>Mouse</strong>, and unified <strong>Keyboard & Mouse Combos</strong>. To complement your mobile workspace, we also offer premium HP <strong>Docking Stations</strong>, durable <strong>Laptop Bags</strong>, and certified original <strong>Power Adapters</strong>.
                            </p>
                            <p>
                                Our physical showroom, situated on Pantheon Road in Egmore, Chennai, serves as a direct retail center where customers can walk in to explore products, verify specifications in person, and purchase hardware immediately from our available inventory. We keep our focus entirely on retail and distribution, ensuring that our customers always receive brand-new, sealed boxes directly from authorized supply chains.
                            </p>
                        </div>
                    </div>

                    {/* Right: Showroom Image / Graphics */}
                    <div className="lg:col-span-5 w-full flex items-center justify-center">
                        <div className="relative w-full max-w-md aspect-[4/3] rounded-2xl overflow-hidden shadow-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-2">
                            <div className="relative w-full h-full rounded-xl overflow-hidden">
                                <Image
                                    src="/about-us-workspace.png"
                                    alt="Signature Computers Egmore Chennai Showroom"
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="w-full bg-white dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800 py-12">
                <div className="w-full px-4 sm:px-8 lg:px-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-gray-50 dark:bg-black border border-gray-100 dark:border-gray-800/30">
                            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 mb-4">
                                <FiAward className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                {yearsOfExperience}+ Years
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Industry Excellence</p>
                        </div>

                        <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-gray-50 dark:bg-black border border-gray-100 dark:border-gray-800/30">
                            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 mb-4">
                                <FiUsers className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                {happyCustomers.toLocaleString()}+
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Customers Served</p>
                        </div>

                        <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-gray-50 dark:bg-black border border-gray-100 dark:border-gray-800/30">
                            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 mb-4">
                                <FiClock className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                10:00 AM – 8:00 PM
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Store Showroom Hours</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values / Why Trust Us Grid */}
            <section className="w-full px-4 sm:px-8 lg:px-12 py-16">
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <span className="text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        Why Choose Us
                    </span>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mt-2">
                        Setting the Standard in Chennai
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-850 hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                            <FiCheckCircle size={22} />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-base mb-2">
                            Authorized Dealer
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                            Certified HP Business Partner sourcing entirely through legal, direct distributor channels.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-850 hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                            <FiShield size={22} />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-base mb-2">
                            Manufacturer Warranty
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                            All products are sealed brand-new box packs backed by official HP corporate warranty.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-850 hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                            <FiUsers size={22} />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-base mb-2">
                            Bulk Sales & Supply
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                            We specialize in bulk hardware procurement for commercial offices and business setups.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-850 hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                            <FiMapPin size={22} />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-base mb-2">
                            Local Chennai Showroom
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                            Local physical presence in Egmore, offering walk-in product demonstrations and stock collections.
                        </p>
                    </div>
                </div>
            </section>

            {/* Visit Store Section */}
            <section className="w-full px-4 sm:px-8 lg:px-12 pb-16">
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-900 dark:to-slate-900 rounded-2xl p-8 lg:p-12 border border-blue-100 dark:border-gray-800 flex flex-col lg:flex-row items-center justify-between gap-8">
                    <div className="space-y-4 max-w-2xl">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                            Visit Our Showroom in Egmore
                        </h2>
                        <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                            Have bulk purchase requirements or want to check out models before buying? Walk into our showroom or get in touch for bulk inventory availability.
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300 pt-2">
                            <div className="flex items-center gap-2">
                                <FiMapPin className="text-blue-600 shrink-0" size={16} />
                                <span>Ground Floor, Sri Kalyan Square, 83/52 Pantheon Rd, Egmore, Chennai - 600008</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FiPhone className="text-blue-600 shrink-0" size={16} />
                                <a href="tel:+919884285858" className="hover:underline">+91 98842 85858</a>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 shrink-0 w-full lg:w-auto">
                        <Link
                            href="/products"
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-center transition-colors shadow-sm"
                        >
                            Explore Products
                        </Link>
                        <Link
                            href="#contact-footer"
                            className="px-6 py-3 bg-white dark:bg-black text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-950 border border-gray-200 dark:border-gray-800 font-medium rounded-lg text-center transition-colors"
                        >
                            Contact Us
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
