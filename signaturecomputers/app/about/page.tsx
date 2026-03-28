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
    title: 'About Us | Signature Computers - HP Authorized Partner Chennai',
    description: 'Learn about Signature Computers, the leading provider of premium IT hardware, laptops, desktops, and enterprise IT services in Chennai since 2005.',
    alternates: {
        canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://signaturecomputers.in'}/about`
    }
};

export default function AboutPage() {
    return (
        <div className="flex flex-col min-h-screen bg-white">
            <LocalBusinessSchema />

            {/* Hidden SEO Content for Crawlers */}
            <div className="sr-only">
                <h1>Our Journey & Commitment to Excellence</h1>
                <p>Signature Computers began with a simple yet ambitious vision: to bridge the gap between rapidly evolving technology and the everyday consumer and business. Located in the heart of Chennai at Egmore, we have established ourselves as a premier destination for genuine IT hardware, comprehensive technical support, and enterprise infrastructure solutions.</p>
                <h2>Authorized HP Partnerships</h2>
                <p>Our enduring relationship as an authorized HP partner allows us to offer an unparalleled selection of HP laptops, desktops, workstations, and enterprise servers. This direct partnership ensures that every product passing through our doors carries the official manufacturer warranty and meets the highest global standards for quality and reliability. In addition to HP, we curate a selection of top-tier brands for networking gear, peripherals, and software to provide complete, robust solutions.</p>
                <h2>Our Core Philosophy</h2>
                <p>We believe that selling a computer is merely the beginning of a relationship, not the end of a transaction. The core philosophy of Signature Computers is rooted in post-sales support and technological education. We take the time to understand your unique use case—whether you are an avid gamer, a creative professional rendering 4K video, or an enterprise IT manager outfitting a new office—to recommend the precise hardware that maximizes your return on investment.</p>
                <h3>Dedication to Integrity and Transparency</h3>
                <p>The IT market can often feel overwhelming, with complex specifications, jargon, and fluctuating prices. We combat this by practicing absolute transparency. When you consult with our team, you receive straightforward advice tailored to your budget. We do not upsell unnecessary capabilities; instead, we focus on future-proofing your setup efficiently.</p>
                <h3>Community and Enterprise Reach</h3>
                <p>Over the years, Signature Computers has proudly supported local educational institutions, healthcare facilities, and small-to-medium enterprises (SMEs) across Tamil Nadu. By providing reliable IT lifelines and robust networked environments, we empower our community to compete globally. Our dedicated B2B division specializes in bulk procurement, customized configurations, and rapid deployment for growing businesses.</p>
                <p>We invite you to visit our retail space to experience our products firsthand, or contact our sales team to discuss how Signature Computers can elevate your technological capabilities. Your success in the digital realm is our utmost priority.</p>
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
