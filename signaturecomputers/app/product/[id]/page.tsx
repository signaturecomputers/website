import { Metadata } from 'next';
import { getProductById } from '@/lib/products';
import { notFound } from 'next/navigation';
import ProductDetails from './ProductDetails';

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const product = await getProductById(id);

    if (!product) {
        return {
            title: 'Product Not Found',
            description: 'The requested product could not be found at Signature Computers, Egmore, Chennai.',
            robots: { index: false, follow: false }
        };
    }

    const title = `${product.productInfo?.title || product.name} Price in Chennai`;
    const description = product.description 
        ? product.description.substring(0, 155) + '...'
        : `Buy ${product.name} at Signature Computers in Egmore, Chennai. Best deals on laptops and desktops with warranty.`;

    return {
        title,
        description,
        robots: { index: true, follow: true },
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://signaturecomputers.in'}/product/${id}`
        }
    };
}

export default async function ProductDetailsPage({ params }: PageProps) {
    const { id } = await params;
    const product = await getProductById(id);

    if (!product) {
        notFound();
    }

    return <ProductDetails id={id} />;
}
