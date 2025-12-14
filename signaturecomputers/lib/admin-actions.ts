'use server';

import { db } from '@/lib/firebaseClient';
import { doc, getDoc, collection, query, where, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

// Helper to sanitize data (remove undefined)
const sanitizeData = (data: any) => {
    return Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== undefined)
    );
};

export async function validateAdminAccessKey(key: string) {
    console.log(`[Auth] Validating key: ${key}`);

    let reason = "Unknown Error";

    // 1. Check Environment Variables
    const envKeys = process.env.ADMIN_ACCESS_KEY || '';
    const validEnvKeys = envKeys.split(',').map(k => k.trim()).filter(k => k.length > 0);
    console.log(`[Auth] Env Keys loaded: ${validEnvKeys.length}`);

    if (validEnvKeys.includes(key)) {
        console.log('[Auth] Matched Env Key');
        return { success: true };
    } else {
        reason = "Key not found in Environment Variables.";
    }

    // 2. Check Firestore (admin_settings/admin_access_key)
    try {
        console.log('[Auth] Checking Firestore...');
        const docRef = doc(db, 'admin_settings', 'admin_access_key');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const dbData = docSnap.data();
            const dbKey = dbData?.key || '';
            const validDbKeys = dbKey.split(',').map((k: string) => k.trim()).filter((k: string) => k.length > 0);

            if (validDbKeys.includes(key)) {
                console.log('[Auth] Matched Firestore Key');
                return { success: true };
            } else {
                reason += " Key not found in Firestore (Key mismatch).";
            }
        } else {
            console.log('[Auth] No admin_settings/admin_access_key doc found');
            reason += " Firestore document 'admin_settings/admin_access_key' not found.";
        }
    } catch (error: any) {
        console.error('[Auth] Error fetching admin key from Firestore:', error);
        reason += ` Firestore Error: ${error.message}`;
    }

    console.log('[Auth] Key verification failed');
    return { success: false, reason };
}

export async function loginAdmin(username: string, password: string) {
    try {
        const usersRef = collection(db, "admin_users");
        const q = query(usersRef, where("username", "==", username));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return { success: false, error: 'Invalid credentials' };
        }

        // In a real app, verify hash. User prompt implies simple string match for now.
        // We find the user with the matching password.
        let user: any = null;
        snapshot.forEach(docSnap => {
            if (docSnap.data().password === password) {
                user = { id: docSnap.id, ...docSnap.data() };
            }
        });

        if (user) {
            return {
                success: true,
                user: {
                    username: user.username,
                    role: user.role
                }
            };
        }
        return { success: false, error: 'Invalid credentials' };

    } catch (error) {
        console.error("Login error:", error);
        return { success: false, error: 'Login failed' };
    }
}

export async function createProduct(category: string, productData: any) {
    try {
        const sanitized = sanitizeData(productData);
        const collRef = collection(db, category);
        const docRef = await addDoc(collRef, sanitized);
        revalidatePath('/admindashboard/products');
        revalidatePath('/products');
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error creating product:', error);
        return { success: false, error: 'Failed to create product' };
    }
}

export async function updateProduct(category: string, productId: string, productData: any) {
    try {
        const sanitized = sanitizeData(productData);
        const docRef = doc(db, category, productId);
        await updateDoc(docRef, sanitized);
        revalidatePath('/admindashboard/products');
        revalidatePath('/products');
        revalidatePath(`/product/${productId}`);
        return { success: true };
    } catch (error) {
        console.error('Error updating product:', error);
        return { success: false, error: 'Failed to update product' };
    }
}

export async function deleteProduct(category: string, productId: string) {
    try {
        const docRef = doc(db, category, productId);
        await deleteDoc(docRef);
        revalidatePath('/admindashboard/products');
        revalidatePath('/products');
        return { success: true };
    } catch (error) {
        console.error('Error deleting product:', error);
        return { success: false, error: 'Failed to delete product' };
    }
}
