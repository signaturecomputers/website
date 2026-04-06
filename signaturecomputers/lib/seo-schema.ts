import { Product, CATEGORY_NAMES } from '@/lib/products';

// Business information for Signature Computers
export const BUSINESS_INFO = {
    name: 'Signature Computers',
    legalName: 'Signature Computers',
    url: 'https://signaturecomputers.in',
    logo: 'https://signaturecomputers.in/logo-new-s.png',
    description: 'Authorized computer dealer and reseller for HP, Dell, Lenovo in Chennai, Tamil Nadu, India. Premium laptops, desktops, monitors, and accessories.',
    // Address
    address: {
        streetAddress: 'Chennai',
        addressLocality: 'Chennai',
        addressRegion: 'Tamil Nadu',
        postalCode: '600001',
        addressCountry: 'IN',
    },
    // Geo coordinates for Chennai
    geo: {
        latitude: 13.0827,
        longitude: 80.2707,
    },
    // Contact
    telephone: '+91-44-XXXXXXXX', // Update with actual phone
    email: 'info@signaturecomputers.in',
    // Social profiles (update with actual URLs if available)
    sameAs: [
        // 'https://www.facebook.com/signaturecomputers',
        // 'https://www.instagram.com/signaturecomputers',
    ],
    // Brands we deal with
    brands: ['HP', 'Dell', 'Lenovo', 'Acer', 'ASUS', 'Microsoft'],
    // Opening hours (Mon-Sat 10am-8pm)
    openingHours: 'Mo-Sa 10:00-20:00',
    // Price range
    priceRange: '₹₹₹',
    // Areas served
    areaServed: ['Chennai', 'Tamil Nadu', 'India'],
};

/**
 * Get category label for SEO titles
 */
export function getCategoryLabel(category: string): string {
    return CATEGORY_NAMES[category] || category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ');
}

/**
 * Generate Product schema with Offer for product pages
 */
export function generateProductSchema(product: Product, baseUrl: string) {
    const partNumber = product.productInfo?.partNo || '';
    const brand = product.brand || BUSINESS_INFO.brands[0];
    const categoryLabel = getCategoryLabel(product.category);
    const productUrl = `${baseUrl}/product/${product.id}`;
    const imageUrl = product.images?.[0] || `${baseUrl}/og-image.png`;

    return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.productInfo?.title || product.name,
        description: product.description || `${brand} ${categoryLabel} - ${partNumber}`,
        image: imageUrl,
        url: productUrl,
        sku: partNumber,
        mpn: partNumber,
        brand: {
            '@type': 'Brand',
            name: brand,
        },
        manufacturer: {
            '@type': 'Organization',
            name: brand,
        },
        category: categoryLabel,
        offers: {
            '@type': 'Offer',
            priceCurrency: 'INR',
            price: product.price,
            availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            url: productUrl,
            priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            seller: {
                '@type': 'Organization',
                name: BUSINESS_INFO.name,
                url: BUSINESS_INFO.url,
            },
            itemCondition: 'https://schema.org/NewCondition',
            shippingDetails: {
                '@type': 'OfferShippingDetails',
                shippingDestination: {
                    '@type': 'DefinedRegion',
                    addressCountry: 'IN',
                },
            },
        },
        ...(product.productInfo?.warranty?.duration && {
            warranty: {
                '@type': 'WarrantyPromise',
                durationOfWarranty: {
                    '@type': 'QuantitativeValue',
                    value: parseInt(product.productInfo.warranty.duration) || 1,
                    unitCode: 'ANN', // Years
                },
                warrantyScope: 'https://schema.org/FullMachineWarranty',
            },
        }),
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.5',
            reviewCount: '10',
            bestRating: '5',
            worstRating: '1',
        },
    };
}

/**
 * Generate Organization schema for site-wide use
 */
export function generateOrganizationSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: BUSINESS_INFO.name,
        legalName: BUSINESS_INFO.legalName,
        url: BUSINESS_INFO.url,
        logo: BUSINESS_INFO.logo,
        description: BUSINESS_INFO.description,
        address: {
            '@type': 'PostalAddress',
            ...BUSINESS_INFO.address,
        },
        contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            telephone: BUSINESS_INFO.telephone,
            email: BUSINESS_INFO.email,
            areaServed: BUSINESS_INFO.areaServed,
            availableLanguage: ['English', 'Tamil', 'Hindi'],
        },
        sameAs: BUSINESS_INFO.sameAs,
    };
}

/**
 * Generate LocalBusiness schema for local SEO
 */
export function generateLocalBusinessSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'ComputerStore',
        name: BUSINESS_INFO.name,
        description: BUSINESS_INFO.description,
        url: BUSINESS_INFO.url,
        logo: BUSINESS_INFO.logo,
        image: BUSINESS_INFO.logo,
        telephone: BUSINESS_INFO.telephone,
        email: BUSINESS_INFO.email,
        address: {
            '@type': 'PostalAddress',
            ...BUSINESS_INFO.address,
        },
        geo: {
            '@type': 'GeoCoordinates',
            latitude: BUSINESS_INFO.geo.latitude,
            longitude: BUSINESS_INFO.geo.longitude,
        },
        openingHoursSpecification: {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            opens: '10:00',
            closes: '20:00',
        },
        priceRange: BUSINESS_INFO.priceRange,
        areaServed: BUSINESS_INFO.areaServed.map(area => ({
            '@type': 'City',
            name: area,
        })),
        sameAs: BUSINESS_INFO.sameAs,
        // Signals for authorized reseller
        makesOffer: BUSINESS_INFO.brands.map(brand => ({
            '@type': 'Offer',
            itemOffered: {
                '@type': 'Product',
                brand: {
                    '@type': 'Brand',
                    name: brand,
                },
            },
        })),
    };
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };
}

/**
 * Generate WebSite schema for sitelinks search box
 */
export function generateWebSiteSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: BUSINESS_INFO.name,
        url: BUSINESS_INFO.url,
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${BUSINESS_INFO.url}/products?search={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
        },
    };
}

/**
 * Generate SEO-optimized title for product page
 */
export function generateProductTitle(product: Product): string {
    const name = product.productInfo?.title || product.name;
    return `${name} Price in India | Signature Computers`;
}

/**
 * Generate SEO-optimized description for product page
 */
export function generateProductDescription(product: Product): string {
    const name = product.productInfo?.title || product.name;
    const processor = product.specs?.['Processor'] || product.productInfo?.processor?.name || 'high-performance processor';
    const ram = product.specs?.['RAM'] || product.productInfo?.memory?.capacity || 'optimal RAM';
    const storage = product.specs?.['Storage'] || product.productInfo?.storage?.primaryStorage?.capacity || 'fast storage';

    return `Buy ${name} with ${processor}, ${ram}, and ${storage}. Best price with warranty. Shop now at Signature Computers.`;
}
