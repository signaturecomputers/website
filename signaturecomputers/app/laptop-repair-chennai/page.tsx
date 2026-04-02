import { Metadata } from 'next';
import LocalBusinessSchema from '../../components/seo/LocalBusinessSchema';
import Hero from '@/components/Hero';
import BrandMarquee from '@/components/BrandMarquee';
import CategorySection from '@/components/CategorySection';
import AboutSection from '@/components/AboutSection';
import HotDealsSection from '@/components/HotDealsSection';
import CustomerReviewsSection from '@/components/CustomerReviewsSection';
import ScrollHandler from '@/components/ScrollHandler';
import AuthModal from '@/components/AuthModal';

export const metadata: Metadata = {
    title: 'Expert Laptop Repair Chennai | Best Laptop Service Center | Signature Computers',
    description: 'Top-rated laptop repair in Chennai. Signature Computers offers motherboard repairs, screen replacements, and AMC for HP, Dell, Lenovo, and Apple laptops.',
    robots: { index: true, follow: true },
    alternates: {
        canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://signaturecomputers.in'}/laptop-repair-chennai`
    }
};

export default function LaptopRepairChennaiPage() {
    return (
        <div className="flex flex-col min-h-screen bg-white">
            <LocalBusinessSchema />

            {/* Hidden SEO Content for Crawlers */}
            <div className="sr-only">
                <h1>Expert Laptop Repair in Chennai</h1>
                <p>Reliable, fast, and affordable laptop repair services in Chennai. We fix motherboard issues, broken screens, battery problems, and data recovery for all major brands.</p>
                <h2>Your Trusted Laptop Service Center in Chennai</h2>
                <p>A malfunctioning laptop can immediately paralyze your work, studies, and personal life. At Signature Computers, located in Egmore, Chennai, we understand the urgency of hardware failures. As one of the most trusted names in laptop servicing, we provide end-to-end diagnostic and repair solutions. Our certified technicians have the expertise to resurrect laptops that other centers might declare irreparable.</p>
                <h3>Comprehensive Laptop Repair Services</h3>
                <p>We service a vast array of brands—including HP, Dell, Lenovo, ASUS, Acer, and Apple. Our repair portfolio includes Motherboard Repair & Chip-Level Fixes, Screen & Display Replacements, Keyboard & Trackpad Repair, Battery & Power Jack Issues, and Data Recovery & OS Troubleshooting.</p>
                <h3>Why Choose Us For Laptop Repair in Chennai?</h3>
                <p>Not all repair centers are created equal. We stand out through our commitment to quality and transparency. Before any repair begins, a thorough diagnostic is performed. You are provided with a complete breakdown of the problem and the exact cost of parts and labor. We do not believe in hidden charges.</p>
                <p>Because we maintain a robust inventory of spare parts directly sourced from manufacturers, our average turnaround time is significantly lower than the industry standard. Many common repairs, such as RAM upgrades, SSD installations, and battery replacements, are often completed on the same day.</p>
                <h3>Corporate Laptop Maintenance & AMC Support</h3>
                <p>For businesses operating in Chennai, unexpected hardware failures translate directly into lost revenue. Our Annual Maintenance Contracts (AMC) provide regular preventive maintenance, rapid response times for critical failures, and loaner laptops to keep your workforce productive. Partner with Signature Computers to ensure your company IT fleet operates at peak efficiency year-round.</p>
            </div>

            <ScrollHandler />
            <AuthModal />
            <Hero />
            <BrandMarquee />
            <CategorySection />
            <AboutSection />
            <HotDealsSection />
            <CustomerReviewsSection />
        </div>
    );
}
