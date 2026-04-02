import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Get a Quote | Signature Computers',
    description: 'Request a customized quote for premium laptops, desktops, and enterprise IT hardware from Signature Computers in Chennai.',
    robots: { index: true, follow: true },
    alternates: {
        canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://signaturecomputers.in'}/get-quote`
    }
};

export default function GetQuoteLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
