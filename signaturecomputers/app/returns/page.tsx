import { Metadata } from 'next';
import LegalPageContent from '@/components/LegalPageContent';

export const metadata: Metadata = {
    title: 'Refund & Cancellation Policy | Signature Computers',
    description: 'Refund and Cancellation Policy for orders placed at Signature Computers.',
    robots: { index: true, follow: true },
    alternates: { canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://signaturecomputers.in'}/returns` }
};

export default function ReturnsPage() {
    return <LegalPageContent pageId="returns" defaultTitle="Refund & Cancellation Policy" />;
}
