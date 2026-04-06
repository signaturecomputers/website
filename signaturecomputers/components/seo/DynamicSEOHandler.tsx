'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { BUSINESS_INFO } from '@/lib/seo-schema';

export default function DynamicSEOHandler() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // The base URL comes from BUSINESS_INFO.url or env
    const baseUrl = BUSINESS_INFO.url.replace(/\/$/, '');
    
    // Construct the canonical URL using the current pathname (ignoring query params for SEO canonical)
    const canonicalUrl = `${baseUrl}${pathname === '/' ? '' : pathname}`;

    return (
        <link rel="canonical" href={canonicalUrl} />
    );
}
