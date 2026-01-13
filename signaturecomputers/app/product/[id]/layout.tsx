import { Metadata } from 'next';
import { getProductById } from '@/lib/products';
import {
    generateProductTitle,
    generateProductDescription,
    BUSINESS_INFO
} from '@/lib/seo-schema';

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

    // Generate SEO-optimized title and description
    const seoTitle = generateProductTitle(product);
    const seoDescription = generateProductDescription(product);

    // Canonical URL
    const canonicalUrl = `${BUSINESS_INFO.url}/product/${id}`;

    // Product images
    const images = product.images && product.images.length > 0
        ? product.images
        : [`${BUSINESS_INFO.url}/og-image.png`];

    // Part number and brand for keywords
    const partNumber = product.productInfo?.partNo || '';
    const brand = product.brand || '';

    return {
        title: seoTitle,
        description: seoDescription,
        keywords: [
            partNumber,
            brand,
            product.category,
            'buy online',
            'price in India',
            'Chennai',
            'Tamil Nadu',
            'authorized dealer',
            'Signature Computers',
        ].filter(Boolean),
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            title: seoTitle,
            description: seoDescription,
            url: canonicalUrl,
            type: 'website',
            siteName: BUSINESS_INFO.name,
            locale: 'en_IN',
            images: images.map(url => ({
                url,
                width: 1200,
                height: 630,
                alt: product.productInfo?.title || product.name,
            })),
        },
        twitter: {
            card: 'summary_large_image',
            title: seoTitle,
            description: seoDescription,
            images: images,
        },
        // Geo meta tags for local SEO
        other: {
            'geo.region': 'IN-TN',
            'geo.placename': 'Chennai',
            'geo.position': '13.0827;80.2707',
            'ICBM': '13.0827, 80.2707',
        },
    };
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
