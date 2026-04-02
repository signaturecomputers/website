import { Metadata } from 'next';
import { BUSINESS_INFO } from '@/lib/seo-schema';
import { CATEGORY_SEO } from '@/lib/category-seo';

type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const seoData = CATEGORY_SEO[slug];
    
    return {
        title: seoData?.title || `${slug.charAt(0).toUpperCase() + slug.slice(1)} | Signature Computers`,
        description: seoData?.description || `Buy ${slug} online at Signature Computers, Chennai. Best prices and official warranty.`,
        robots: {
            index: true,
            follow: true,
        },
        alternates: {
            canonical: `${BUSINESS_INFO.url}/category/${slug}`,
        },
    };
}

export default function CategoryLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
