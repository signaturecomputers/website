import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const DEFAULT_WINDOWS_PRICE = 5000;
export const WINDOWS_SERVICE_NAME = 'Windows 11 Pro OEM Key & Installation';

// Check if a product has Free DOS operating system
export function isFreeDOSProduct(product: any): boolean {
    // Check in specs
    if (product.specs?.['Operating System']) {
        const os = product.specs['Operating System'].toLowerCase();
        return os.includes('freedos') || os.includes('free dos');
    }

    // Check in productInfo
    if (product.productInfo?.operatingSystem?.os) {
        const os = product.productInfo.operatingSystem.os.toLowerCase();
        return os.includes('freedos') || os.includes('free dos');
    }

    return false;
}

// Get Windows installation price from Firestore
export async function getWindowsInstallationPrice(): Promise<number> {
    try {
        const docRef = doc(db, 'site_settings', 'windowsInstallation');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data().price || DEFAULT_WINDOWS_PRICE;
        }

        return DEFAULT_WINDOWS_PRICE;
    } catch (error) {
        console.error('Error fetching Windows installation price:', error);
        return DEFAULT_WINDOWS_PRICE;
    }
}

// Get Windows installation configuration
export async function getWindowsInstallationConfig(): Promise<{
    price: number;
    serviceName: string;
    enabled: boolean;
}> {
    try {
        const docRef = doc(db, 'site_settings', 'windowsInstallation');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                price: data.price || DEFAULT_WINDOWS_PRICE,
                serviceName: data.serviceName || WINDOWS_SERVICE_NAME,
                enabled: data.enabled !== false, // Default to true
            };
        }

        return {
            price: DEFAULT_WINDOWS_PRICE,
            serviceName: WINDOWS_SERVICE_NAME,
            enabled: true,
        };
    } catch (error) {
        console.error('Error fetching Windows installation config:', error);
        return {
            price: DEFAULT_WINDOWS_PRICE,
            serviceName: WINDOWS_SERVICE_NAME,
            enabled: true,
        };
    }
}
