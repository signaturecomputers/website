import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const COLLECTIONS = [
    'laptops', 'desktops', 'monitors', 'accessories', 'printers', 'cartridges', 'toners',
    // Accessories subcategories
    'keyboards', 'mouse', 'keyboard-mouse-combo', 'headphones', 'cables',
    'power-adapters', 'bags', 'docks', 'usb-flashdrives', 'dvd-writers',
    // Additional categories
    'workstations', 'cctv'
];

export interface ProductInfo {
    // Basic Info
    title?: string;
    partNo?: string;
    series?: string;
    recommendedUsage?: string;
    idealFor?: string[];

    // Appearance
    appearance?: {
        color?: string;
        design?: string;
        formFactor?: string;
    };

    // Operating System
    operatingSystem?: {
        os?: string;
    };

    // Processor
    processor?: {
        generation?: string;
        brand?: string;
        name?: string;
        maxClockSpeed?: string;
        cache?: string;
        cores?: number;
        threads?: number;
        technology?: string;
        chipset?: string;
    };

    // Memory
    memory?: {
        capacity?: string;
        type?: string;
        speed?: string;
        layout?: string;
    };

    // Storage
    storage?: {
        primaryStorage?: {
            type?: string;
            capacity?: string;
        };
        cloudStorage?: {
            service?: string;
            capacity?: string;
            duration?: string;
        };
    };

    // Display
    display?: {
        size?: string;
        diagonal?: string;
        resolution?: string;
        aspectRatio?: string;
        panel?: string;
        antiGlare?: boolean;
        brightness?: string;
        colorGamut?: string;
        touchscreen?: boolean;
        flickerFree?: boolean;
        screenToBodyRatio?: string;
    };

    // Graphics
    graphics?: {
        gpu?: string;
        dedicated?: boolean;
    };

    // Audio & Input
    audioAndInput?: {
        speakers?: string;
        touchpad?: string;
        keyboard?: {
            type?: string;
            backlit?: boolean;
            color?: string;
        };
    };

    // Connectivity
    connectivity?: {
        wifi?: string;
        bluetooth?: string;
        modernStandby?: boolean;
    };

    // Ports
    ports?: {
        usbTypeC?: string;
        usbTypeA?: string;
        hdmi?: {
            version?: string;
            count?: number;
        };
        audioJack?: string;
        powerPort?: string;
    };

    // Camera
    camera?: {
        webcam?: string;
        features?: string[];
    };

    // Battery & Power
    batteryAndPower?: {
        batteryType?: string;
        capacity?: string;
        charger?: string;
        fastCharge?: string;
    };

    // Security
    security?: {
        micMuteKey?: boolean;
        cameraPrivacyShutter?: boolean;
        tpm?: string;
    };

    // Software
    software?: {
        preInstalled?: Array<{
            name?: string;
            trialPeriod?: string;
        }>;
    };

    // Dimensions & Weight
    dimensionsAndWeight?: {
        dimensions?: {
            front?: string;
            rear?: string;
        };
        weight?: string;
    };

    // Warranty
    warranty?: {
        duration?: string;
        coverage?: string;
        onSiteService?: boolean;
    };

    // Certifications
    certifications?: {
        energyStar?: boolean;
    };

    // Environmental
    environmental?: {
        oceanBoundPlastic?: boolean;
        recycledKeycaps?: boolean;
    };
}

export interface Product {
    id: string;
    name: string;
    brand: string;
    price: number;
    originalPrice?: number;
    stock: number;
    images: string[];
    description: string;
    specs: Record<string, string>;
    category: string;
    // Map for UI
    image: string;  // Changed from optional to required for UI compatibility
    rating?: number;
    // Structured product info
    productInfo?: ProductInfo;
}

export async function getAllProducts(): Promise<Product[]> {
    try {
        const promises = COLLECTIONS.map(col => getDocs(collection(db, col)));
        const productPromises = COLLECTIONS.map(async (collectionName) => {
            try {
                const querySnapshot = await getDocs(collection(db, collectionName));
                return querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        category: collectionName, // Add category for filtering
                        image: data.images?.[0] || '',
                        rating: 4.5,
                    } as Product;
                });
            } catch (err) {
                console.warn(`Failed to fetch ${collectionName}:`, err);
                return []; // Return empty array on failure (e.g. permission error)
            }
        });

        const results = await Promise.all(productPromises);

        // Flatten the array of arrays
        return results.flat();
    } catch (error) {
        console.warn('Warning: Some collections could not be fetched (likely due to missing permissions):', error);
        return [];
    }
}

export async function getProductById(id: string): Promise<Product | null> {
    try {
        const promises = COLLECTIONS.map(async (col) => {
            try {
                const snap = await getDoc(doc(db, col, id));
                return snap;
            } catch (err) {
                // If permission denied or other error, return null-like
                console.warn(`Error checking collection ${col}:`, err);
                return null;
            }
        });

        const snapshots = await Promise.all(promises);

        // Filter out nulls and check for existence
        const foundSnap = snapshots.find(snap => snap && snap.exists());

        if (foundSnap) {
            const data = foundSnap.data() || {};
            const category = foundSnap.ref.parent.id; // Get collection name
            return {
                id: foundSnap.id,
                ...data,
                category,
                image: data.images?.[0] || '',
            } as Product;
        }

        return null;
    } catch (error) {
        console.error('Error fetching product by ID:', error);
        return null;
    }
}

// Get related products from same category
export async function getRelatedProducts(category: string, excludeId: string, limit: number = 4): Promise<Product[]> {
    try {
        const colRef = collection(db, category);
        const snapshot = await getDocs(colRef);

        const products = snapshot.docs
            .filter(doc => doc.id !== excludeId)
            .slice(0, limit)
            .map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    category,
                    image: data.images?.[0] || '',
                } as Product;
            });

        return products;
    } catch (error) {
        console.error('Error fetching related products:', error);
        return [];
    }
}

// Get suggested accessories based on product category
export async function getSuggestedAccessories(productCategory: string): Promise<{ category: string; categoryName: string; products: Product[] }[]> {
    try {
        const suggestions: { category: string; categoryName: string; products: Product[] }[] = [];

        if (productCategory === 'laptops') {
            // For laptops: suggest bags and mouse
            const bagsSnapshot = await getDocs(collection(db, 'bags'));
            const mouseSnapshot = await getDocs(collection(db, 'mouse'));

            if (bagsSnapshot.docs.length > 0) {
                const bags = bagsSnapshot.docs.slice(0, 2).map(doc => {
                    const data = doc.data();
                    return { id: doc.id, ...data, category: 'bags', image: data.images?.[0] || '' } as Product;
                });
                suggestions.push({ category: 'bags', categoryName: 'Laptop Bags', products: bags });
            }

            if (mouseSnapshot.docs.length > 0) {
                const mice = mouseSnapshot.docs.slice(0, 2).map(doc => {
                    const data = doc.data();
                    return { id: doc.id, ...data, category: 'mouse', image: data.images?.[0] || '' } as Product;
                });
                suggestions.push({ category: 'mouse', categoryName: 'Mouse', products: mice });
            }
        } else if (productCategory === 'desktops' || productCategory === 'workstations') {
            // For desktops/workstations: suggest monitors
            const monitorsSnapshot = await getDocs(collection(db, 'monitors'));

            if (monitorsSnapshot.docs.length > 0) {
                const monitors = monitorsSnapshot.docs.slice(0, 2).map(doc => {
                    const data = doc.data();
                    return { id: doc.id, ...data, category: 'monitors', image: data.images?.[0] || '' } as Product;
                });
                suggestions.push({ category: 'monitors', categoryName: 'Monitors', products: monitors });
            }
        }

        return suggestions;
    } catch (error) {
        console.error('Error fetching suggested accessories:', error);
        return [];
    }
}

// Category display names for search results
export const CATEGORY_NAMES: Record<string, string> = {
    'laptops': 'Laptops',
    'desktops': 'Desktops',
    'workstations': 'Workstations',
    'monitors': 'Monitors',
    'printers': 'Printers',
    'accessories': 'Accessories',
    'cartridges': 'Cartridges',
    'toners': 'Toners',
    'cctv': 'CCTV',
    'keyboards': 'Keyboards',
    'mouse': 'Mouse',
    'keyboard-mouse-combo': 'Keyboard & Mouse Combo',
    'headphones': 'Headphones',
    'cables': 'Cables',
    'power-adapters': 'Power Adapters',
    'bags': 'Bags',
    'docks': 'Docks',
    'usb-flashdrives': 'USB Flash Drives',
    'dvd-writers': 'DVD Writers',
};

export interface SearchResults {
    products: Product[];
    categories: { id: string; name: string }[];
}

export async function searchProducts(query: string): Promise<SearchResults> {
    if (!query || query.trim().length < 2) {
        return { products: [], categories: [] };
    }

    const searchTerm = query.toLowerCase().trim();

    try {
        // Fetch all products
        const allProducts = await getAllProducts();

        // Filter products by name or brand
        const matchingProducts = allProducts.filter(product => {
            const name = product.name?.toLowerCase() || '';
            const brand = product.brand?.toLowerCase() || '';
            return name.includes(searchTerm) || brand.includes(searchTerm);
        }).slice(0, 5); // Limit to 5 products

        // Find matching categories
        const matchingCategories = Object.entries(CATEGORY_NAMES)
            .filter(([id, name]) =>
                name.toLowerCase().includes(searchTerm) ||
                id.toLowerCase().includes(searchTerm)
            )
            .map(([id, name]) => ({ id, name }))
            .slice(0, 3); // Limit to 3 categories

        return {
            products: matchingProducts,
            categories: matchingCategories,
        };
    } catch (error) {
        console.error('Error searching products:', error);
        return { products: [], categories: [] };
    }
}

