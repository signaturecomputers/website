import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const COLLECTIONS = ['laptops', 'desktops', 'monitors', 'accessories', 'components'];

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
}

export async function getAllProducts(): Promise<Product[]> {
    try {
        const promises = COLLECTIONS.map(col => getDocs(collection(db, col)));
        const snapshots = await Promise.all(promises);

        let allProducts: Product[] = [];

        snapshots.forEach((snap, index) => {
            const category = COLLECTIONS[index];
            const products = snap.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    category,
                    image: data.images?.[0] || '',
                    rating: 4.5,
                } as Product;
            });
            allProducts = [...allProducts, ...products];
        });

        return allProducts;
    } catch (error) {
        console.error('Error fetching all products:', error);
        return [];
    }
}

export async function getProductById(id: string): Promise<Product | null> {
    try {
        const promises = COLLECTIONS.map(col => getDoc(doc(db, col, id)));
        const snapshots = await Promise.all(promises);

        const foundSnap = snapshots.find(snap => snap.exists());

        if (foundSnap) {
            const data = foundSnap.data();
            return {
                id: foundSnap.id,
                ...data,
                image: data.images?.[0] || '',
            } as Product;
        }

        return null;
    } catch (error) {
        console.error('Error fetching product by ID:', error);
        return null;
    }
}
