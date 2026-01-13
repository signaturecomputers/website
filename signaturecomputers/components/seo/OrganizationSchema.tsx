'use client';

import { useEffect, useState } from 'react';
import {
    generateOrganizationSchema,
    generateLocalBusinessSchema,
    generateWebSiteSchema
} from '@/lib/seo-schema';

/**
 * Component that injects Organization, LocalBusiness, and WebSite JSON-LD 
 * structured data into the page for site-wide SEO.
 */
export default function OrganizationSchema() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const organizationSchema = generateOrganizationSchema();
    const localBusinessSchema = generateLocalBusinessSchema();
    const webSiteSchema = generateWebSiteSchema();

    return (
        <>
            {/* Organization Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(organizationSchema),
                }}
            />
            {/* LocalBusiness Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(localBusinessSchema),
                }}
            />
            {/* WebSite Schema with Search Action */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(webSiteSchema),
                }}
            />
        </>
    );
}
