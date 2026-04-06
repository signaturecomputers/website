import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Cart | Signature Computers',
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
