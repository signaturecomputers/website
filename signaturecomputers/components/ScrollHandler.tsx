'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function ScrollHandlerContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const scrollTo = searchParams.get('scrollTo');
        if (scrollTo) {
            const element = document.getElementById(scrollTo);
            if (element) {
                // Short timeout to ensure layout is ready
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' });
                    // Clean URL
                    // Use history.replaceState to avoid a router refresh/flicker
                    const newUrl = window.location.pathname;
                    window.history.replaceState(null, '', newUrl);
                }, 100);
            }
        }
    }, [searchParams]);

    return null;
}

export default function ScrollHandler() {
    return (
        <Suspense fallback={null}>
            <ScrollHandlerContent />
        </Suspense>
    );
}
