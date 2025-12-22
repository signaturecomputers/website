import { Metadata } from 'next';
import LegalPageContent from '@/components/LegalPageContent';

export const metadata: Metadata = {
    title: 'Return & Refund Policy | Signature Computers',
    description: 'Return and Refund Policy for products purchased from Signature Computers.',
};

export default function ReturnsPage() {
    return <LegalPageContent pageId="returns" defaultTitle="Return & Refund Policy" />;
}
