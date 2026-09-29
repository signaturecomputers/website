/**
 * Helper function to determine if a product belongs in the "Old Material" / "End of Life (EOL)" section.
 * Criteria:
 * 1. product.isOldMaterial === true (explicitly moved by admin, only allowed if stock === 0)
 * 2. OR product stock is <= 0 and was manually restored/moved from old stock without stock update for > 24 hours.
 * 3. OR product stock is <= 0 and has remained 0 for over 30 days (1 month), unless within the 24h grace period of a manual restore.
 * Note: If product.stock > 0, it is NEVER old material.
 */
export function isProductOldMaterial(product: {
    stock?: number;
    isOldMaterial?: boolean;
    zeroStockDate?: string | null;
    oldMaterialDate?: string | null;
    restoredFromOldMaterialDate?: string | null;
    updatedAt?: string | null;
    createdAt?: string | null;
    [key: string]: any;
}): boolean {
    const stock = Number(product.stock ?? 0);

    // Products with stock > 0 can never be in Old Material
    if (stock > 0) {
        return false;
    }

    // 1. Explicitly marked as Old Material by admin
    if (product.isOldMaterial === true) {
        return true;
    }

    const now = Date.now();
    const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000; // 24 hours

    // 2. Product was manually moved/restored from old stock:
    if (product.restoredFromOldMaterialDate) {
        const restoredTime = new Date(product.restoredFromOldMaterialDate).getTime();
        if (!isNaN(restoredTime)) {
            // If more than 24 hours have passed and stock was not updated (> 0), send it back to old material
            if (now - restoredTime >= TWENTY_FOUR_HOURS_MS) {
                return true;
            }
            // If still within 24 hours grace period, keep it in regular products!
            return false;
        }
    }

    // 3. Regular zero-stock rule: stock is 0 for over 30 days (1 month)
    const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

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
    restoredFromOldMaterialDate?: string | null;
    updatedAt?: string | null;
    createdAt?: string | null;
    [key: string]: any;
}): { label: string; date?: string; type: 'manual' | 'unupdated_24h' | 'zero_stock_30d' } {
    if (product.isOldMaterial) {
        return {
            label: 'Manually Moved (End of Life)',
            date: product.oldMaterialDate ? new Date(product.oldMaterialDate).toLocaleDateString('en-IN') : undefined,
            type: 'manual'
        };
    }

    const stock = Number(product.stock ?? 0);
    if (stock <= 0 && product.restoredFromOldMaterialDate) {
        const restoredTime = new Date(product.restoredFromOldMaterialDate).getTime();
        const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
        if (!isNaN(restoredTime) && Date.now() - restoredTime >= TWENTY_FOUR_HOURS_MS) {
            return {
                label: 'Stock not updated (>24h after restore)',
                date: new Date(product.restoredFromOldMaterialDate).toLocaleDateString('en-IN'),
                type: 'unupdated_24h'
            };
        }
    }

    const refDate = product.zeroStockDate || product.updatedAt || product.createdAt;
    return {
        label: '0 Stock for > 30 Days',
        date: refDate ? new Date(refDate).toLocaleDateString('en-IN') : undefined,
        type: 'zero_stock_30d'
    };
}

/**
 * Checks if a restored 0-stock product is within the 24-hour grace window to update stock
 */
export function getRestoredGracePeriodInfo(product: {
    stock?: number;
    restoredFromOldMaterialDate?: string | null;
    [key: string]: any;
}): { isWithinGrace: boolean; remainingHours?: number; remainingMinutes?: number } {
    const stock = Number(product.stock ?? 0);
    if (stock <= 0 && product.restoredFromOldMaterialDate) {
        const restoredTime = new Date(product.restoredFromOldMaterialDate).getTime();
        if (!isNaN(restoredTime)) {
            const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
            const elapsed = Date.now() - restoredTime;
            const remaining = TWENTY_FOUR_HOURS_MS - elapsed;
            if (remaining > 0) {
                const remainingHours = Math.floor(remaining / (60 * 60 * 1000));
                const remainingMinutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
                return {
                    isWithinGrace: true,
                    remainingHours,
                    remainingMinutes
                };
            }
        }
    }
    return { isWithinGrace: false };
}

