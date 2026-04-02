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
    title: 'Expert IT Services & Solutions | Signature Computers Chennai',
    description: 'Comprehensive IT services, hardware sales, and enterprise solutions. Signature Computers is an authorized HP Partner providing top-tier tech support.',
    robots: { index: true, follow: true },
    alternates: {
        canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://signaturecomputers.in'}/services`
    }
};

export default function ServicesPage() {
    return (
        <div className="flex flex-col min-h-screen bg-white">
            <LocalBusinessSchema />

            {/* Hidden SEO Content for Crawlers */}
            <div className="sr-only">
                <h1>Premium IT Services & Tech Solutions</h1>
                <p>From enterprise networking to specialized hardware repair, Signature Computers provides comprehensive IT lifecycle management for businesses and individuals in Chennai.</p>
                <h2>Comprehensive Hardware & Software Solutions</h2>
                <p>At Signature Computers, we understand that technology is the backbone of modern business and daily life. As an authorized HP Partner, we offer a vast array of IT services designed to keep your systems running smoothly, securely, and efficiently. Our team of certified technicians brings decades of combined experience to every support request, ensuring rapid resolution of complex technical challenges.</p>
                <p>Whether you are a startup needing a complete office network setup or an individual requiring urgent laptop repair, our services scale to meet your exact requirements. We prioritize minimal downtime, using genuine replacement parts and industry-standard diagnostic tools to identify and fix issues at their source.</p>
                <h3>Enterprise IT Infrastructure Setup</h3>
                <p>Building a reliable IT infrastructure requires careful planning and expert execution. We specialize in end-to-end network deployment, server configuration, and workstation setup. Our team assesses your current and future computational needs to design an architecture that supports seamless scaling. We handle cabling, router configuration, switch management, and continuous monitoring to prevent bottlenecks.</p>
                <h3>Annual Maintenance Contracts (AMC)</h3>
                <p>Preventive maintenance is critical to avoiding catastrophic data loss and hardware failure. Our Annual Maintenance Contracts provide peace of mind through regular automated backups, routine hardware cleaning, software updates, and priority response times for emergency calls. By partnering with Signature Computers for your AMC, you transform unpredictable IT repair costs into a manageable, predictable budget item. We support laptops, desktops, printers, and enterprise network components under our comprehensive AMC plans.</p>
                <h3>Advanced Diagnostic & Repair Services</h3>
                <p>When hardware fails, every minute counts. Our repair facility in Egmore, Chennai, is equipped to handle complex motherboard repairs, screen replacements, keyboard troubleshooting, and power supply issues. We stock a wide variety of OEM components, drastically reducing turnaround times. Before initiating any repair, we conduct a thorough diagnostic check and provide a transparent cost estimate, ensuring you make an informed decision without hidden fees.</p>
                <h3>Why Choose Signature Computers for IT Services?</h3>
                <ul>
                    <li>Authorized Expertise: As an official HP partner, our technicians are trained on the latest architectures and standard operating procedures.</li>
                    <li>Genuine Parts: We strictly use OEM-certified replacement parts to guarantee longevity and compatibility.</li>
                    <li>Customer-Centric Approach: Clear communication, rapid response, and transparent pricing form the core of our service philosophy.</li>
                    <li>Comprehensive Coverage: From a simple RAM upgrade to deploying a multi-site Virtual Private Network (VPN), we do it all.</li>
                </ul>
                <p>Technology shouldn't be a hurdle; it should be a catalyst for your success. Contact Signature Computers today to discover how our tailored IT services can optimize your digital workflow and secure your operational capability.</p>
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
