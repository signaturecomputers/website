/**
 * Lookup table mapping old/renamed/removed product IDs to new URLs.
 * Keys are the old product IDs, and values are the redirection targets.
 * Redirection targets can be absolute paths (e.g. `/product/new-id`) or general listings (e.g. `/products`).
 */
export const PRODUCT_REDIRECTS: Record<string, string> = {
    'old-laptop-hdx16': '/products?category=laptops',
    'hp-pavilion-15-old': '/product/hp-pavilion-15-new',
    'dell-inspiron-14-old': '/product/dell-inspiron-14-new',
    // Fallbacks can be defined dynamically or here
};

/**
 * Get redirection target for a given product ID.
 * Returns the target URL or a fallback '/products' URL.
 */
export function getProductRedirectTarget(id: string): string {
    return PRODUCT_REDIRECTS[id] || '/products';
}
