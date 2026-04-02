import Hero from '@/components/Hero';
import BrandMarquee from '@/components/BrandMarquee';
import CategorySection from '@/components/CategorySection';
import AboutSection from '@/components/AboutSection';
import HotDealsSection from '@/components/HotDealsSection';
import CustomerReviewsSection from '@/components/CustomerReviewsSection';
import ScrollHandler from '@/components/ScrollHandler';
import AuthModal from '@/components/AuthModal';
import { Metadata } from 'next';
import { BUSINESS_INFO } from '@/lib/seo-schema';

export const metadata: Metadata = {
  alternates: {
    canonical: BUSINESS_INFO.url,
  },
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <ScrollHandler />
      <AuthModal />
      <Hero />
      <BrandMarquee />
      <CategorySection />
      <AboutSection />
      <HotDealsSection />
      <CustomerReviewsSection />
      {/* Footer ID is handled in the Footer component itself */}
    </div>
  );
}
