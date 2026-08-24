'use server';

import { adminDb } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { headers } from 'next/headers';
import { FieldValue } from 'firebase-admin/firestore';

// Helper to get client IP in Next.js Server Actions
async function getClientIp() {
    try {
        const headersList = await headers();
        const forwardedFor = headersList.get('x-forwarded-for');
        if (forwardedFor) {
            return forwardedFor.split(',')[0].trim();
        }
        return headersList.get('x-real-ip') || '127.0.0.1';
    } catch (e) {
        return '127.0.0.1';
    }
}

// Rate limit helper
async function checkRateLimit(identifier: string, collectionName: string): Promise<{ blocked: boolean; timeLeft?: number }> {
    try {
        const ip = await getClientIp();
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

        // Check rate limit for both the input identifier (email/username) and the client IP address
        const checkIdentifiers = [identifier, ip].filter(Boolean);

        for (const id of checkIdentifiers) {
            const snapshot = await adminDb.collection(collectionName)
                .where('identifier', '==', id)
                .where('timestamp', '>=', fifteenMinutesAgo)
                .where('success', '==', false)
                .get();

            if (snapshot.size >= 5) {
                let newestTimestamp = fifteenMinutesAgo.getTime();
                snapshot.forEach((doc: any) => {
                    const data = doc.data();
                    const ts = data.timestamp?.toDate ? data.timestamp.toDate().getTime() : new Date(data.timestamp).getTime();
                    if (ts > newestTimestamp) {
                        newestTimestamp = ts;
                    }
                });
                const blockExpires = newestTimestamp + 15 * 60 * 1000;
                const timeLeft = Math.max(0, Math.ceil((blockExpires - Date.now()) / 1000));
                return { blocked: true, timeLeft };
            }
        }
        return { blocked: false };
    } catch (error) {
        console.error(`Rate limit check error for ${collectionName}:`, error);
        return { blocked: false };
    }
}

// Record login attempt helper
async function recordLoginAttempt(identifier: string, collectionName: string, success: boolean) {
    try {
        const ip = await getClientIp();

        if (success) {
            // Successful login clears previous failed attempts
            const checkIdentifiers = [identifier, ip].filter(Boolean);
            for (const id of checkIdentifiers) {
                const snapshot = await adminDb.collection(collectionName)
                    .where('identifier', '==', id)
                    .get();
                if (!snapshot.empty) {
                    const batch = adminDb.batch();
                    snapshot.docs.forEach((doc: any) => {
                        batch.delete(doc.ref);
                    });
                    await batch.commit();
                }
            }
        } else {
            // Record failed attempt for both identifier and IP
            const batch = adminDb.batch();
            if (identifier) {
                const docRef = adminDb.collection(collectionName).doc();
                batch.set(docRef, {
                    identifier,
                    ip,
                    timestamp: FieldValue.serverTimestamp(),
                    success: false,
                    createdAt: new Date().toISOString()
                });
            }
            if (ip && ip !== identifier) {
                const docRef = adminDb.collection(collectionName).doc();
                batch.set(docRef, {
                    identifier: ip,
                    ip,
                    timestamp: FieldValue.serverTimestamp(),
                    success: false,
                    createdAt: new Date().toISOString()
                });
            }
            await batch.commit();
        }
    } catch (error) {
        console.error(`Record login attempt error for ${collectionName}:`, error);
    }
}

// Rate limiting exports for Admin
export async function checkAdminAuthRateLimit(identifier: string) {
    return checkRateLimit(identifier, 'admin_login_attempts');
}

export async function recordAdminAuthLoginAttempt(identifier: string, success: boolean) {
    return recordLoginAttempt(identifier, 'admin_login_attempts', success);
}

// Rate limiting exports for Customer
export async function checkCustomerRateLimit(identifier: string) {
    return checkRateLimit(identifier, 'customer_login_attempts');
}

export async function recordCustomerLoginAttempt(identifier: string, success: boolean) {
    return recordLoginAttempt(identifier, 'customer_login_attempts', success);
}

// Migration step to hash plaintext passwords with bcrypt
export async function migratePlaintextPasswords() {
    try {
        const usersSnapshot = await adminDb.collection("admin_users").get();
        for (const docSnap of usersSnapshot.docs) {
            const data = docSnap.data();
            const storedPassword = data.password;
            if (storedPassword && !storedPassword.startsWith('$2a$') && !storedPassword.startsWith('$2b$')) {
                const hashedPassword = await bcrypt.hash(storedPassword, 10);
                await adminDb.collection("admin_users").doc(docSnap.id).update({
                    password: hashedPassword
                });
                console.log(`[Migration] Plaintext password for admin ${data.username || docSnap.id} has been hashed.`);
            }
        }
    } catch (err) {
        console.error("[Migration] Failed to migrate plaintext passwords:", err);
    }
}

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
        // Rate limit check
        const rateLimit = await checkAdminAuthRateLimit(username);
        if (rateLimit.blocked) {
            return {
                success: false,
                error: `Too many failed attempts. Try again in ${Math.ceil((rateLimit.timeLeft || 0) / 60)} minutes.`
            };
        }

        // Run plaintext password migration if any exist in DB
        await migratePlaintextPasswords();

        const usersSnapshot = await adminDb.collection("admin_users")
            .where("username", "==", username)
            .get();

        if (usersSnapshot.empty) {
            await recordAdminAuthLoginAttempt(username, false);
            return { success: false, error: 'Invalid credentials' };
        }

        let user: any = null;
        for (const docSnap of usersSnapshot.docs) {
            const data = docSnap.data();
            const storedPassword = data.password;

            // Strict bcrypt.compare verification only
            let isMatch = false;
            if (storedPassword && (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$'))) {
                isMatch = await bcrypt.compare(password, storedPassword);
            }

            if (isMatch) {
                user = { id: docSnap.id, ...data };
                break;
            }
        }

        if (user) {
            await recordAdminAuthLoginAttempt(username, true);
            return {
                success: true,
                user: {
                    username: user.username,
                    role: user.role
                }
            };
        }

        await recordAdminAuthLoginAttempt(username, false);
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

        // Write record to deleted_products collection for 410 handling
        await adminDb.collection('deleted_products').doc(productId).set({
            productId,
            category: collectionName,
            deletedAt: new Date().toISOString()
        });

        revalidatePath('/admindashboard/products');
        revalidatePath('/products');
        revalidatePath(`/product/${productId}`);
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

export async function updateProductStock(productId: string, category: string, newStock: number) {
    try {
        let targetCategory = category === 'webcams' ? 'dvd-writers' : category;
        if (targetCategory === 'probook' || targetCategory === 'zbook-firefly' || targetCategory === 'elitebook') {
            targetCategory = 'laptops';
        }
        const collectionName = targetCategory === 'hubs' ? 'docks' : targetCategory;

        await adminDb.collection(collectionName).doc(productId).update({
            stock: newStock,
            updatedAt: new Date().toISOString()
        });

        revalidatePath('/admindashboard/products');
        revalidatePath('/products');
        revalidatePath(`/product/${productId}`);
        return { success: true };
    } catch (error: any) {
        console.error('Error updating stock:', error);
        return { success: false, error: error.message || 'Failed to update stock' };
    }
}

export async function updateSiteTheme(theme: string, username: string) {
    try {
        await adminDb.collection("site_settings").doc("theme").set({
            currentTheme: theme,
            isActive: theme !== "default",
            updatedBy: username,
            updatedAt: new Date()
        }, { merge: true });
        revalidatePath('/admindashboard/settings');
        return { success: true };
    } catch (error: any) {
        console.error("Error updating theme:", error);
        return { success: false, error: error.message || "Failed to update theme" };
    }
}

export async function updateWindowsPrice(price: number, username: string) {
    try {
        await adminDb.collection("site_settings").doc("windowsInstallation").set({
            price: price,
            serviceName: "Windows 11 Pro OEM Key & Installation",
            enabled: true,
            updatedBy: username,
            updatedAt: new Date()
        }, { merge: true });
        revalidatePath('/admindashboard/settings');
        return { success: true };
    } catch (error: any) {
        console.error("Error updating Windows price:", error);
        return { success: false, error: error.message || "Failed to update Windows price" };
    }
}

export async function updateAdminAccessKey(key: string, username: string) {
    try {
        await adminDb.collection("admin_settings").doc("admin_access_key").set({
            key: key,
            updatedBy: username,
            updatedAt: new Date()
        }, { merge: true });
        revalidatePath('/admindashboard/settings');
        return { success: true };
    } catch (error: any) {
        console.error("Error updating key:", error);
        return { success: false, error: error.message || "Failed to update key" };
    }
}

export async function addHotDeal(productId: string, order: number) {
    try {
        const dealRef = adminDb.collection('hot_deals').doc(productId);
        const docSnap = await dealRef.get();
        if (docSnap.exists) {
            return { success: false, error: 'Product is already a hot deal' };
        }

        await dealRef.set({
            productId,
            order,
            addedAt: new Date().toISOString()
        });

        revalidatePath('/admindashboard/hot-deals');
        revalidatePath('/hot-deals');
        return { success: true };
    } catch (error: any) {
        console.error('Error adding hot deal:', error);
        return { success: false, error: error.message || 'Failed to add hot deal' };
    }
}

export async function removeHotDeal(dealId: string) {
    try {
        await adminDb.collection('hot_deals').doc(dealId).delete();
        revalidatePath('/admindashboard/hot-deals');
        revalidatePath('/hot-deals');
        return { success: true };
    } catch (error: any) {
        console.error('Error removing hot deal:', error);
        return { success: false, error: error.message || 'Failed to remove hot deal' };
    }
}

export async function updateHotDealPrice(category: string, productId: string, price: number, originalPrice: number) {
    try {
        let targetCategory = category === 'webcams' ? 'dvd-writers' : category;
        if (targetCategory === 'probook' || targetCategory === 'zbook-firefly' || targetCategory === 'elitebook') {
            targetCategory = 'laptops';
        }
        const collectionName = targetCategory === 'hubs' ? 'docks' : targetCategory;

        await adminDb.collection(collectionName).doc(productId).update({
            price,
            originalPrice,
            updatedAt: new Date().toISOString()
        });

        revalidatePath('/admindashboard/hot-deals');
        revalidatePath('/hot-deals');
        revalidatePath(`/product/${productId}`);
        return { success: true };
    } catch (error: any) {
        console.error('Error updating hot deal price:', error);
        return { success: false, error: error.message || 'Failed to update hot deal price' };
    }
}

