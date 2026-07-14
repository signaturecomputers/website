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
                allow: ['/', '/products', '/products?category='],
                disallow: [
                    '/admindashboard/',  // Exclude admin pages
                    '/admin/',
                    '/adminaccess',       // Exclude admin access
                    '/api/',              // Exclude API routes
                    '/checkout/',         // Exclude checkout for privacy
                    '/profile/',          // Exclude user profiles
                    '/orders/',           // Exclude order pages
                    '/invoice/',          // Exclude invoice pages
                    '/cart/',
                    '/*add-to-cart*',
                    '/*add-to-wishlist*',
                    '/*remove_compare_item*',
                ],
            },
            {
                userAgent: 'Googlebot',
                allow: ['/', '/products', '/products?category='],
                disallow: [
                    '/admindashboard/',
                    '/admin/',
                    '/adminaccess',
                    '/api/',
                    '/checkout/',
                    '/profile/',
                    '/orders/',
                    '/invoice/',
                    '/cart/',
                    '/*add-to-cart*',
                    '/*add-to-wishlist*',
                    '/*remove_compare_item*',
                ],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
        host: baseUrl,
    };
}
