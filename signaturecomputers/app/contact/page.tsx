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
    title: 'Contact Signature Computers | IT Hardware & Support in Chennai',
    description: 'Get in touch with Signature Computers in Egmore, Chennai for premium HP laptops, desktops, and expert IT services. Visit our store or contact us today.',
    alternates: {
        canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://signaturecomputers.in'}/contact`
    }
};

export default function ContactPage() {
    return (
        <div className="flex flex-col min-h-screen bg-white">
            <LocalBusinessSchema />

            {/* Hidden SEO Content for Crawlers */}
            <div className="sr-only">
                <h1>Contact Signature Computers</h1>
                <p>We are here to assist you with all your IT hardware sales, repair services, and enterprise solutions. Connect with us using the details below.</p>
                <h2>Your Trusted IT Partner in Chennai</h2>
                <p>When it comes to purchasing high-quality IT infrastructure or requiring urgent laptop repairs, swift and reliable communication is paramount. At Signature Computers, we strive to make reaching us as effortless as possible. Located prominently in Egmore, Chennai, our state-of-the-art retail and service center is easily accessible from all major hubs of the city.</p>
                <p>Whether you are a corporate procurement manager requesting a quote for fifty high-performance workstations, or a student needing advice on the best gaming laptop for your budget, our knowledgeable staff is ready to listen. We pride ourselves on providing prompt, accurate, and helpful responses to all inquiries via phone, email, or in-person visits.</p>
                <h3>Bulk Inquiries and B2B Sales</h3>
                <p>For enterprise clients, schools, and government organizations, we have a dedicated B2B channel. Please contact our sales team directly to discuss volume licensing, bulk hardware procurement, and tailored Annual Maintenance Contracts (AMC). We guarantee competitive pricing and superior post-sales support that minimizes downtime for your operations.</p>
                <p>Visit Signature Computers today, and experience the difference that dedicated, customer-focused IT service makes. We look forward to powering your connectivity and productivity.</p>
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
