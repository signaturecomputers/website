import { MetadataRoute } from 'next';
import { getAllProductsServer } from '@/lib/products-server';
import { BUSINESS_INFO } from '@/lib/seo-schema';

/**
 * Dynamic sitemap generation for SEO.
 * Includes all product pages, category pages, and static pages.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = BUSINESS_INFO.url;

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${baseUrl}/products`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/hot-deals`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/get-quote`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/privacy`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${baseUrl}/returns`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${baseUrl}/shipping-delivery`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
    ];

    // Category pages
    const categories = [
        'laptops', 'desktops', 'workstations', 'monitors', 'memory-storage',
        'accessories', 'memory', 'storage',
        'keyboards', 'mouse', 'keyboard-mouse-combo', 'headphones',
        'cables', 'power-adapters', 'bags', 'docks', 'hubs', 'usb-flashdrives', 'dvd-writers'
    ];

    const categoryPages: MetadataRoute.Sitemap = categories.map(category => ({
        url: `${baseUrl}/products?category=${category}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    // Product pages - fetch all products dynamically
    let productPages: MetadataRoute.Sitemap = [];

    try {
        const products = await getAllProductsServer();
        productPages = products.map(product => {
            const prod = product as any;
            let lastModified = new Date();
            if (prod.updatedAt) {
                try {
                    lastModified = typeof prod.updatedAt.toDate === 'function'
                        ? prod.updatedAt.toDate()
                        : new Date(prod.updatedAt);
                } catch (e) {
                    console.warn(`Error parsing updatedAt for product ${product.id}:`, e);
                }
            }
            return {
                url: `${baseUrl}/product/${product.id}`,
                lastModified,
                changeFrequency: 'weekly' as const,
                priority: 0.7,
            };
        });
    } catch (error) {
        console.error('Error fetching products for sitemap:', error);
    }

    return [...staticPages, ...categoryPages, ...productPages];
}
