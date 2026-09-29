/**
 * Helper function to determine if a product belongs in the "Old Material" / "End of Life (EOL)" section.
 * Criteria:
 * 1. product.isOldMaterial === true (explicitly moved by admin)
 * 2. OR product stock is 0 and has remained 0 for over 30 days (1 month).
 */
export function isProductOldMaterial(product: {
    stock?: number;
    isOldMaterial?: boolean;
    zeroStockDate?: string | null;
    oldMaterialDate?: string | null;
    updatedAt?: string | null;
    createdAt?: string | null;
    [key: string]: any;
}): boolean {
    if (product.isOldMaterial === true) {
        return true;
    }

    const stock = Number(product.stock ?? 0);
    if (stock <= 0) {
        const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
        const now = Date.now();

        if (product.zeroStockDate) {
            const zeroTime = new Date(product.zeroStockDate).getTime();
            if (!isNaN(zeroTime) && now - zeroTime >= ONE_MONTH_MS) {
                return true;
            }
        } else {
            // Fallback to updatedAt or createdAt if zeroStockDate is not explicitly set
            const refDate = product.updatedAt || product.createdAt;
            if (refDate) {
                const refTime = new Date(refDate).getTime();
                if (!isNaN(refTime) && now - refTime >= ONE_MONTH_MS) {
                    return true;
                }
            }
        }
    }

    return false;
}

/**
 * Returns human-readable status for why product is in Old Material
 */
export function getOldMaterialReason(product: {
    stock?: number;
    isOldMaterial?: boolean;
    zeroStockDate?: string | null;
    oldMaterialDate?: string | null;
    updatedAt?: string | null;
    createdAt?: string | null;
    [key: string]: any;
}): { label: string; date?: string } {
    if (product.isOldMaterial) {
        return {
            label: 'Manually Moved (End of Life)',
            date: product.oldMaterialDate ? new Date(product.oldMaterialDate).toLocaleDateString('en-IN') : undefined
        };
    }

    const refDate = product.zeroStockDate || product.updatedAt || product.createdAt;
    return {
        label: '0 Stock for > 30 Days',
        date: refDate ? new Date(refDate).toLocaleDateString('en-IN') : undefined
    };
}
