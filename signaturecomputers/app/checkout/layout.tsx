import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Checkout | Signature Computers',
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
