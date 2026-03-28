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
    title: 'IT Support Chennai | IT Infrastructure & Networking Solutions',
    description: 'Signature Computers provides professional IT support, AMC services, and enterprise networking solutions for businesses throughout Chennai and Tamil Nadu.',
    alternates: {
        canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://signaturecomputers.in'}/it-support-chennai`
    }
};

export default function ITSupportChennaiPage() {
    return (
        <div className="flex flex-col min-h-screen bg-white">
            <LocalBusinessSchema />

            {/* Hidden SEO Content for Crawlers */}
            <div className="sr-only">
                <h1>Enterprise IT Support in Chennai</h1>
                <p>Scalable IT infrastructure, proactive maintenance, and dedicated helpdesk support for organizations in Chennai. We ensure your technology accelerates your business.</p>
                <h2>Reliable IT Support Services for Chennai Businesses</h2>
                <p>In today's digital economy, an organization's speed and reliability are entirely dependent on its IT infrastructure. For businesses in Chennai attempting to scale rapidly, internally managing servers, networks, and workstation troubleshooting can drain critical resources. Signature Computers provides comprehensive B2B IT support, acting as your outsourced tech department.</p>
                <h3>Our Core IT Support Solutions</h3>
                <p>We tailor our services to meet the specific demands of your industry, whether you operate a boutique design agency needing high-bandwidth storage networks, or a corporate office requiring robust data security. Solutions include Network Design & Implementation, Server Setup & Maintenance, Workstation Fleet Management, and Data Backup & Disaster Recovery.</p>
                <h3>Annual Maintenance Contracts (AMC)</h3>
                <p>Our Annual Maintenance Contracts are the hallmark of our IT support offerings in Chennai. Under an AMC, Signature Computers provides scheduled on-site preventive maintenance, cleaning, system updates, and priority remote support. This proactive approach stops the majority of IT failures before they happen, significantly reducing long-term costs. When unexpected issues do arise, our Service Level Agreements (SLAs) guarantee rapid on-site intervention.</p>
                <h3>Why Chennai Businesses Trust Us</h3>
                <p>With decades of experience and standing as an Authorized HP Partner, Signature Computers has the vendor relationships required to procure enterprise gear quickly and cost-effectively. Unlike generic IT repair shops, our engineers are fully certified to handle complex enterprise routing, switching, and virtualization tasks. Let Signature Computers manage the complexity of your IT needs in Chennai, so you can focus entirely on growing your core business.</p>
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
