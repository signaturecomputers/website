import { Metadata } from 'next';
import { CATEGORY_NAMES } from '@/lib/products';
import CategoryProducts from './CategoryProducts';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const categoryName = CATEGORY_NAMES[slug] || (slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : 'Category');

    return {
        title: `${categoryName} Store Chennai | Best Prices in Egmore | Signature Computers`,
        description: `Shop for premium ${categoryName} at Signature Computers in Egmore, Chennai. Best deals on HP, Dell, and Lenovo ${categoryName.toLowerCase()} with authorized warranty.`,
        robots: { index: true, follow: true },
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://signaturecomputers.in'}/category/${slug}`
        }
    };
}

export default async function CategoryPage({ params }: PageProps) {
    const { slug } = await params;
    return <CategoryProducts slug={slug} />;
}
