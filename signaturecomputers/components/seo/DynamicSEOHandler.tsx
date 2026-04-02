'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BUSINESS_INFO } from '@/lib/seo-schema';

export default function DynamicSEOHandler() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [shouldApplySEO, setShouldApplySEO] = useState(false);

    useEffect(() => {
        // Fast paths to check against
        const isActionPath = 
            pathname.includes('/add-to-cart') ||
            pathname.includes('/add-to-wishlist') ||
            pathname.includes('/remove_compare_item');
            
        // Fast query check
        const isActionQuery = 
            searchParams.has('add-to-cart') ||
            searchParams.has('wishlist') ||
            searchParams.has('remove_compare_item');

        if (isActionPath || isActionQuery) {
            setShouldApplySEO(true);
        } else {
            setShouldApplySEO(false);
        }
    }, [pathname, searchParams]);

    if (!shouldApplySEO) return null;

    return (
        <>
            <meta name="robots" content="noindex, nofollow" />
            <link rel="canonical" href={BUSINESS_INFO.url} />
        </>
    );
}
