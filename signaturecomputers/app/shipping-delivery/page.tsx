import { Metadata } from 'next';
import LegalPageContent from '@/components/LegalPageContent';

export const metadata: Metadata = {
    title: 'Shipping & Delivery Policy | Signature Computers',
    description: 'Shipping & Delivery Policy for Signature Computers - delivery areas, timelines, and processes.',
    robots: { index: true, follow: true },
    alternates: { canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://signaturecomputers.in'}/shipping-delivery` }
};

export default function ShippingDeliveryPage() {
    return <LegalPageContent pageId="shipping-policy" defaultTitle="Shipping & Delivery Policy" />;
}
