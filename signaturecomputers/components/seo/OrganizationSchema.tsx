import {
    generateOrganizationSchema,
    generateLocalBusinessSchema,
    generateWebSiteSchema
} from '@/lib/seo-schema';

/**
 * Server-rendered structured data. Rendering this in the initial HTML means
 * search crawlers do not have to execute client JavaScript to discover it.
 */
export default function OrganizationSchema() {
    const organizationSchema = generateOrganizationSchema();
    const localBusinessSchema = generateLocalBusinessSchema();
    const webSiteSchema = generateWebSiteSchema();

    return (
        <>
            {/* Organization Schema */}
            <script
                id="organization-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(organizationSchema),
                }}
            />
            {/* LocalBusiness Schema */}
            <script
                id="local-business-schema-layout"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(localBusinessSchema),
                }}
            />
            {/* WebSite Schema with Search Action */}
            <script
                id="website-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(webSiteSchema),
                }}
            />
        </>
    );
}
