import Hero from '@/components/Hero';
import BrandMarquee from '@/components/BrandMarquee';
import CategorySection from '@/components/CategorySection';
import AboutSection from '@/components/AboutSection';
import HotDealsSection from '@/components/HotDealsSection';
import CustomerReviewsSection from '@/components/CustomerReviewsSection';
import ScrollHandler from '@/components/ScrollHandler';
import AuthModal from '@/components/AuthModal';
import SEOContentSection from '@/components/SEOContentSection';
import { Metadata } from 'next';
import { BUSINESS_INFO } from '@/lib/seo-schema';
import LocalBusinessSchema from '@/components/seo/LocalBusinessSchema';

export const metadata: Metadata = {
  title: 'Signature Computers Chennai | Premium Laptop & Desktop Store in Egmore',
  description: 'Signature Computers is your ultimate tech store in Egmore, Chennai. Authorized dealer for HP, Dell, Lenovo. Genuine laptops, custom desktops, and IT AMC services.',
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: BUSINESS_INFO.url,
  },
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <LocalBusinessSchema />
      <ScrollHandler />
      <AuthModal />
      <Hero />
      <BrandMarquee />
      <CategorySection />
      <AboutSection />
      <HotDealsSection />
      <CustomerReviewsSection />
      <SEOContentSection />
      {/* Footer ID is handled in the Footer component itself */}
    </div>
  );
}
