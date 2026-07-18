'use client';

import { useRouter, usePathname } from 'next/navigation';
import { MouseEvent } from 'react';

export const useSmoothScroll = () => {
    const router = useRouter();
    const pathname = usePathname();

    const smoothScrollTo = (e: MouseEvent<HTMLAnchorElement>, targetId: string) => {
        e.preventDefault();

        const element = document.getElementById(targetId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            // Clean URL hash (ensure it doesn't stay #targetId)
            window.history.replaceState(null, '', pathname);
        }
        // 2. If element is not on current page
        else {
            router.push(`/?scrollTo=${targetId}`);
        }
    };

    return { smoothScrollTo };
};
