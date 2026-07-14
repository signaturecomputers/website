import { Metadata } from 'next';
import { CATEGORY_NAMES } from '@/lib/products';
import { categoryIntros } from '@/lib/categoryContent';
import CategoryProducts from './CategoryProducts';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const categoryName = CATEGORY_NAMES[slug] || (slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : 'Category');
    const introText = categoryIntros[slug] || `Shop for premium ${categoryName} at Signature Computers in Egmore, Chennai.`;
    const description = introText.length > 150 ? introText.substring(0, 150) + '...' : introText;

    return {
        title: `${categoryName} in Egmore, Chennai`,
        description,
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
