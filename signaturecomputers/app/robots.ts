import { MetadataRoute } from 'next';
import { BUSINESS_INFO } from '@/lib/seo-schema';

/**
 * Robots.txt generation for SEO.
 * Allows all crawlers and references the sitemap.
 */
export default function robots(): MetadataRoute.Robots {
    const baseUrl = BUSINESS_INFO.url;

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/admindashboard/',  // Exclude admin pages
                    '/admin/',
                    '/api/',              // Exclude API routes
                    '/checkout/',         // Exclude checkout for privacy
                    '/profile/',          // Exclude user profiles
                    '/orders/',           // Exclude order pages
                    '/invoice/',          // Exclude invoice pages
                ],
            },
            {
                userAgent: 'Googlebot',
                allow: '/',
                disallow: [
                    '/admindashboard/',
                    '/admin/',
                    '/api/',
                    '/checkout/',
                    '/profile/',
                    '/orders/',
                    '/invoice/',
                ],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
        host: baseUrl,
    };
}
