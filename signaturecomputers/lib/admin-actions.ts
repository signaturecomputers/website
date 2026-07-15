'use server';

import { adminDb } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

// Helper to sanitize data (remove undefined)
const sanitizeData = (data: any) => {
    return Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== undefined)
    );
};

export async function validateAdminAccessKey(key: string) {
    console.log(`[Auth] Validating key: ${key}`);

    // Check Environment Variables only
    const envKeys = process.env.ADMIN_ACCESS_KEY || '';
    const validEnvKeys = envKeys.split(',').map(k => k.trim()).filter(k => k.length > 0);
    console.log(`[Auth] Env Keys loaded: ${validEnvKeys.length}`);

    if (validEnvKeys.includes(key)) {
        console.log('[Auth] Matched Env Key');
        return { success: true };
    }

    console.log('[Auth] Key verification failed');
    return { success: false, reason: "Key not found in Environment Variables." };
}

export async function loginAdmin(username: string, password: string) {
    try {
        const usersSnapshot = await adminDb.collection("admin_users")
            .where("username", "==", username)
            .get();

        if (usersSnapshot.empty) {
            return { success: false, error: 'Invalid credentials' };
        }

        let user: any = null;
        for (const docSnap of usersSnapshot.docs) {
            const data = docSnap.data();
            const storedPassword = data.password;

            let isMatch = false;
            if (storedPassword && (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$'))) {
                isMatch = await bcrypt.compare(password, storedPassword);
            } else {
                if (storedPassword === password) {
                    isMatch = true;
                    // Auto-hash and save plaintext password
                    try {
                        const hashedPassword = await bcrypt.hash(password, 10);
                        await adminDb.collection("admin_users").doc(docSnap.id).update({
                            password: hashedPassword
                        });
                        console.log(`[Auth] Plaintext password for ${username} has been auto-hashed.`);
                    } catch (hashErr) {
                        console.error("[Auth] Failed to hash plaintext password:", hashErr);
                    }
                }
            }

            if (isMatch) {
                user = { id: docSnap.id, ...data };
                break;
            }
        }

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

export async function createAdminUserIfNeeded(uid: string, email: string, username: string) {
    try {
        const userRef = adminDb.collection("admin_users").doc(uid);
        const docSnap = await userRef.get();

        let role = "staff";
        let finalUsername = username;

        if (!docSnap.exists) {
            await userRef.set({
                uid,
                email,
                username: finalUsername,
                role: role,
                createdAt: new Date().toISOString(),
            });
            console.log(`[Auth] Created new admin user document for: ${email}`);
        } else {
            const data = docSnap.data();
            role = data?.role || "staff";
            finalUsername = data?.username || finalUsername;
        }

        return { success: true, role, username: finalUsername };
    } catch (error: any) {
        console.error("Error verifying or creating admin user:", error);
        return { success: false, error: error.message };
    }
}

export async function createProduct(category: string, productData: any) {
    try {
        const sanitized = sanitizeData(productData);
        const collectionName = category === 'hubs' ? 'docks' : category;
        const docRef = await adminDb.collection(collectionName).add(sanitized);
        revalidatePath('/admindashboard/products');
        revalidatePath('/products');
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error creating product:', error);
        return { success: false, error: 'Failed to create product' };
    }
}

export async function updateProduct(productId: string, productData: any, targetCategory: string, originalCategory: string) {
    try {
        const sanitized = sanitizeData(productData);
        const newCollection = targetCategory === 'hubs' ? 'docks' : targetCategory;
        const oldCollection = originalCategory === 'hubs' ? 'docks' : originalCategory;

        if (newCollection !== oldCollection) {
            // Move product: Set in new collection, then delete from old
            await adminDb.collection(newCollection).doc(productId).set(sanitized);
            await adminDb.collection(oldCollection).doc(productId).delete();
        } else {
            // Update in same collection
            await adminDb.collection(newCollection).doc(productId).update(sanitized);
        }

        revalidatePath('/admindashboard/products');
        revalidatePath('/products');
        revalidatePath(`/product/${productId}`);
        return { success: true };
    } catch (error: any) {
        console.error('Error updating product:', error);
        return { success: false, error: error.message || 'Failed to update product' };
    }
}

export async function deleteProduct(category: string, productId: string) {
    try {
        const collectionName = category === 'hubs' ? 'docks' : category;
        await adminDb.collection(collectionName).doc(productId).delete();
        revalidatePath('/admindashboard/products');
        revalidatePath('/products');
        return { success: true };
    } catch (error) {
        console.error('Error deleting product:', error);
        return { success: false, error: 'Failed to delete product' };
    }
}

export async function createCarePack(carePackData: any) {
    try {
        const sanitized = sanitizeData(carePackData);
        const docRef = await adminDb.collection('care_packs').add(sanitized);
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error creating care pack:', error);
        return { success: false, error: 'Failed to create care pack' };
    }
}

export async function updateCarePack(carePackId: string, carePackData: any) {
    try {
        const sanitized = sanitizeData(carePackData);
        await adminDb.collection('care_packs').doc(carePackId).update(sanitized);
        return { success: true };
    } catch (error) {
        console.error('Error updating care pack:', error);
        return { success: false, error: 'Failed to update care pack' };
    }
}

export async function deleteCarePack(carePackId: string) {
    try {
        await adminDb.collection('care_packs').doc(carePackId).delete();
        return { success: true };
    } catch (error) {
        console.error('Error deleting care pack:', error);
        return { success: false, error: 'Failed to delete care pack' };
    }
}
