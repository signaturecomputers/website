import { Metadata } from 'next';
import LegalPageContent from '@/components/LegalPageContent';

export const metadata: Metadata = {
    title: 'Shipping & Delivery Policy | Signature Computers',
    description: 'Shipping & Delivery Policy for Signature Computers - delivery areas, timelines, and processes.',
};

export default function ShippingDeliveryPage() {
    return <LegalPageContent pageId="shipping-policy" defaultTitle="Shipping & Delivery Policy" />;
}
