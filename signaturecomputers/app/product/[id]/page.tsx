import { Metadata } from 'next';
import { getProductById } from '@/lib/products';
import { getProductRedirectTarget } from '@/lib/product-redirects';
import { permanentRedirect } from 'next/navigation';
import ProductDetails from './ProductDetails';

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const product = await getProductById(id);

    if (!product) {
        return {
            title: 'Product Not Found | Signature Computers Chennai',
            description: 'The requested product could not be found at Signature Computers, Egmore, Chennai.',
        };
    }

    const title = `${product.productInfo?.title || product.name} Price in Chennai | Signature Computers Egmore`;
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

    // If product is missing or removed, issue a 301/308 permanent redirect
    if (!product) {
        const redirectTarget = getProductRedirectTarget(id);
        console.log(`[SEO Redirect] Product ID "${id}" not found. Issuing 301/308 redirect to: ${redirectTarget}`);
        permanentRedirect(redirectTarget);
    }

    return <ProductDetails id={id} />;
}
