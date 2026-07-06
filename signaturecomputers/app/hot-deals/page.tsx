import HotDealsSection from '@/components/HotDealsSection';

export const metadata = {
    title: 'Hot Deals & Offers | Signature Computers',
    description: 'Exclusive limited-time offers on premium laptops, workstations, and accessories.',
    robots: { index: true, follow: true },
    alternates: { canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://signaturecomputers.in'}/hot-deals` }
};

export default function HotDealsPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Reusing HotDealsSection in 'page' mode with master-detail layout */}
            {/* The header text is now handled internally by the component when mode="page" */}
            <HotDealsSection
                mode="page"
                subtitle="Daily deals on laptops, desktops, and accessories at Signature Computers, Egmore, Chennai. Prices updated regularly — check back often for limited-time offers on refurbished and new tech."
            />
        </div>
    );
}
