import { Metadata } from 'next';
import LegalPageContent from '@/components/LegalPageContent';

export const metadata: Metadata = {
    title: 'Privacy Policy | Signature Computers',
    description: 'Privacy Policy for Signature Computers - how we collect, use, and protect your data.',
};

export default function PrivacyPage() {
    return <LegalPageContent pageId="privacy" defaultTitle="Privacy Policy" />;
}
