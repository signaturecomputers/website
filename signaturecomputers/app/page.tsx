import Hero from '@/components/Hero';
import CategorySection from '@/components/CategorySection';
import AboutSection from '@/components/AboutSection';
import HotDealsSection from '@/components/HotDealsSection';
import CustomerReviewsSection from '@/components/CustomerReviewsSection';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Hero />
      <CategorySection />
      <AboutSection />
      <HotDealsSection />
      <CustomerReviewsSection />
    </div>
  );
}
