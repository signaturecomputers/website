'use client';

import { useEffect, useState } from 'react';
import { Product } from '@/lib/products';
import { generateProductSchema, generateBreadcrumbSchema, getCategoryLabel, BUSINESS_INFO } from '@/lib/seo-schema';

import Script from 'next/script';

interface ProductSchemaProps {
    product: Product;
}

/**
 * Component that injects Product JSON-LD structured data into the page.
 * This is a client component that runs on hydration to add schema non-blocking.
 */
export default function ProductSchema({ product }: ProductSchemaProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !product) return null;

    const baseUrl = BUSINESS_INFO.url;
    const productSchema = generateProductSchema(product, baseUrl);

    // Generate breadcrumb schema
    const categoryLabel = getCategoryLabel(product.category);
    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: baseUrl },
        { name: categoryLabel, url: `${baseUrl}/category/${product.category}` },
        { name: product.productInfo?.title || product.name, url: `${baseUrl}/product/${product.id}` },
    ]);

    return (
        <>
            {/* Product Schema */}
            <Script
                id={`product-schema-${product.id}`}
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(productSchema),
                }}
            />
            {/* Breadcrumb Schema */}
            <Script
                id={`breadcrumb-schema-${product.id}`}
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(breadcrumbSchema),
                }}
            />
        </>
    );
}
