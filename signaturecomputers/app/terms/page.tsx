import { Metadata } from 'next';
import LegalPageContent from '@/components/LegalPageContent';

export const metadata: Metadata = {
    title: 'Terms & Conditions | Signature Computers',
    description: 'Terms and Conditions for using Signature Computers website and services.',
};

export default function TermsPage() {
    return <LegalPageContent pageId="terms" defaultTitle="Terms & Conditions" />;
}
