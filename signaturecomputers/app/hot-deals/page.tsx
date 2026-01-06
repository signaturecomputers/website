import HotDealsSection from '@/components/HotDealsSection';

export const metadata = {
    title: 'Hot Deals & Offers | Signature Computers',
    description: 'Exclusive limited-time offers on premium laptops, workstations, and accessories.',
};

export default function HotDealsPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Reusing HotDealsSection in 'page' mode with master-detail layout */}
            {/* The header text is now handled internally by the component when mode="page" */}
            <HotDealsSection
                mode="page"
                subtitle="Don't miss out on these limited-time offers! Exclusive discounts on top-tier tech."
            />
        </div>
    );
}
