'use client';

import { useEffect, useState } from 'react';
import {
    generateOrganizationSchema,
    generateLocalBusinessSchema,
    generateWebSiteSchema
} from '@/lib/seo-schema';

import Script from 'next/script';

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
            <Script
                id="organization-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(organizationSchema),
                }}
            />
            {/* LocalBusiness Schema */}
            <Script
                id="local-business-schema-layout"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(localBusinessSchema),
                }}
            />
            {/* WebSite Schema with Search Action */}
            <Script
                id="website-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(webSiteSchema),
                }}
            />
        </>
    );
}
