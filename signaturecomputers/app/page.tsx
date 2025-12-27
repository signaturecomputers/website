import Hero from '@/components/Hero';
import BrandMarquee from '@/components/BrandMarquee';
import CategorySection from '@/components/CategorySection';
import AboutSection from '@/components/AboutSection';
import HotDealsSection from '@/components/HotDealsSection';
import CustomerReviewsSection from '@/components/CustomerReviewsSection';
import ScrollHandler from '@/components/ScrollHandler';
import AuthModal from '@/components/AuthModal';

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
