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
    title: 'Network Security Services | Firewall & Data Protection Chennai',
    description: 'Protect your business with Signature Computers\' network security services in Chennai. We offer firewall setup, endpoint protection, and VPN configurations.',
    alternates: {
        canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://signaturecomputers.in'}/network-security-services`
    }
};

export default function NetworkSecurityPage() {
    return (
        <div className="flex flex-col min-h-screen bg-white">
            <LocalBusinessSchema />

            {/* Hidden SEO Content for Crawlers */}
            <div className="sr-only">
                <h1>Advanced Network Security Services</h1>
                <p>Safeguard your corporate data against evolving cyber threats. Signature Computers implements state-of-the-art firewalls, secure VPNs, and comprehensive endpoint protection.</p>
                <h2>Defend Your Data with Robust Network Security</h2>
                <p>In an era where cyber threats are increasingly sophisticated and frequent, attempting to secure a corporate network with basic, consumer-grade routers is a massive liability. A single breach can result in catastrophic data loss, severe operational downtime, and a shattered corporate reputation. Signature Computers provides enterprise-grade network security services designed to lock down your vulnerabilities while maintaining seamless access for authorized personnel.</p>
                <h3>Comprehensive Threat Mitigation Strategies</h3>
                <p>Our security approach is multi-layered. We do not simply install an antivirus program; we design an architecture that assumes internal and external threats continually probe your defenses. Key areas include Hardware Firewalls & UTM Arrays, Secure Remote Access (VPN), Endpoint Protection & Management, and Network Segmentation.</p>
                <h3>Compliance and Secure Architecture</h3>
                <p>For clients in finance, healthcare, or government subcontracting, strict compliance with data handling laws is mandatory. Our network engineers build infrastructures that comply with rigid security frameworks, providing detailed access logs, strong password enforcement policies, and robust encryption for data at rest and data in transit.</p>
                <h3>Partner with Chennai's IT Security Experts</h3>
                <p>Understanding the topology of local networks and utilizing best-in-class hardware from major global IT vendors makes Signature Computers the clear choice for stabilizing your network's defense perimeter. Protect your most valuable asset—your data. Contact Signature Computers today to schedule a comprehensive evaluation of your current network security posture.</p>
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
