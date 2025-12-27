import { Metadata } from 'next';
import { getProductById } from '@/lib/products';

type Props = {
    params: Promise<{ id: string }>;
    children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const product = await getProductById(id);

    if (!product) {
        return {
            title: 'Product Not Found',
        };
    }

    const description = product.description
        ? (product.description.length > 160 ? product.description.substring(0, 157) + '...' : product.description)
        : 'View this product at Signature Computers';

    const images = product.images && product.images.length > 0
        ? product.images
        : ['/og-image.jpg'];

    return {
        title: product.name,
        description: description,
        openGraph: {
            title: `${product.name} | Signature Computers`,
            description: description,
            images: images.map(url => ({
                url,
                width: 1200,
                height: 630,
                alt: product.name,
            })),
        },
        twitter: {
            card: 'summary_large_image',
            title: `${product.name} | Signature Computers`,
            description: description,
            images: images,
        },
    };
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
