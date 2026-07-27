import { adminDb } from './firebase-admin';
import { Product } from './products';

const COLLECTIONS = [
    'laptops', 'desktops', 'monitors', 'accessories', 'memory', 'storage', 'graphics-cards',
    // Accessories subcategories
    'keyboards', 'mouse', 'keyboard-mouse-combo', 'headphones', 'cables',
    'power-adapters', 'bags', 'docks', 'hubs', 'usb-flashdrives', 'dvd-writers',
    // Additional categories
    'workstations', 'cctv'
];

export async function getAllProductsServer(category?: string): Promise<Product[]> {
    try {
        if (!adminDb || typeof adminDb.collection !== 'function') {
            console.warn('Firebase Admin DB is not initialized properly, returning empty array.');
            return [];
        }

        let collectionsToFetch = COLLECTIONS;

        if (category && category.toLowerCase() !== 'all') {
            const catLower = category.toLowerCase();
            const accessorySubcategories = [
                'keyboards', 'mouse', 'keyboard-mouse-combo', 'headphones', 'cables',
                'power-adapters', 'bags', 'docks', 'hubs', 'usb-flashdrives', 'dvd-writers'
            ];
            const memoryStorageSubcategories = ['memory', 'storage', 'graphics-cards'];

            if (catLower === 'accessories') {
                collectionsToFetch = ['accessories', ...accessorySubcategories];
            } else if (catLower === 'memory-storage' || catLower === 'memory-storage-all') {
                collectionsToFetch = memoryStorageSubcategories;
            } else if (COLLECTIONS.includes(catLower)) {
                collectionsToFetch = [catLower];
            } else {
                collectionsToFetch = [catLower];
            }
        }

        const productPromises = collectionsToFetch.map(async (collectionName) => {
            try {
                const snapshot = await adminDb.collection(collectionName).get();
                return snapshot.docs.map((doc: any) => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        category: collectionName, // Add category for filtering
                        image: data.images?.[0] || '',
                        rating: 4.5,
                        partNumber: data.partNumber || data.partNo || data.productInfo?.partNo || '',
                    } as Product;
                });
            } catch (err) {
                console.warn(`Failed to fetch server-side collection ${collectionName}:`, err);
                return []; // Return empty array on failure
            }
        });

        const results = await Promise.all(productPromises);
        return results.flat();
    } catch (error) {
        console.error('Error in getAllProductsServer:', error);
        return [];
    }
}
