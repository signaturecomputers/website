import { Metadata } from 'next';
import LegalPageContent from '@/components/LegalPageContent';

export const metadata: Metadata = {
    title: 'Refund & Cancellation Policy | Signature Computers',
    description: 'Refund and Cancellation Policy for orders placed at Signature Computers.',
};

export default function ReturnsPage() {
    return <LegalPageContent pageId="returns" defaultTitle="Refund & Cancellation Policy" />;
}
