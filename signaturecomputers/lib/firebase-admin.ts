import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const getServiceAccount = () => {
    try {
        // First check for base64 encoded key (more reliable on Windows)
        const base64Key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64;
        if (base64Key && base64Key.length > 50) {
            try {
                const decoded = Buffer.from(base64Key, 'base64').toString('utf-8');
                const parsed = JSON.parse(decoded);
                console.log('Firebase Admin: Successfully parsed base64 service account key');
                return parsed;
            } catch (b64Error) {
                console.error('Error parsing FIREBASE_SERVICE_ACCOUNT_KEY_BASE64:', b64Error);
            }
        }

        // Fall back to regular JSON key
        const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
        if (!key) {
            console.warn('Warning: FIREBASE_SERVICE_ACCOUNT_KEY and FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 are both missing in .env.local');
            return null;
        }

        // If it's a short value, it's likely broken (multi-line issue)
        if (key.length < 100) {
            console.error('Error: FIREBASE_SERVICE_ACCOUNT_KEY appears truncated (only ' + key.length + ' chars).');
            console.error('Make sure the entire JSON is on ONE line in .env.local');
            console.error('Or add FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 with base64 encoded JSON');
            return null;
        }

        // Try parsing as JSON directly
        try {
            const parsed = JSON.parse(key);
            console.log('Firebase Admin: Successfully parsed JSON service account key');
            return parsed;
        } catch (jsonError) {
            // Maybe it's base64 encoded in the regular key?
            try {
                const decoded = Buffer.from(key, 'base64').toString('utf-8');
                const parsed = JSON.parse(decoded);
                console.log('Firebase Admin: Successfully parsed base64-encoded service account key from FIREBASE_SERVICE_ACCOUNT_KEY');
                return parsed;
            } catch {
                throw jsonError; // Throw original JSON error
            }
        }
    } catch (error) {
        console.error('Error: FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON.');
        console.error('Tip: Add FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 with base64 encoded JSON instead.');
        console.error('Parse error:', error);
        return null;
    }
};

const serviceAccount = getServiceAccount();

console.log('Firebase Admin SDK Init:', {
    hasServiceAccount: !!serviceAccount,
    existingApps: getApps().length,
    keyLength: process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.length || 0,
    base64KeyLength: process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64?.length || 0,
});

if (!getApps().length) {
    if (serviceAccount) {
        try {
            initializeApp({
                credential: cert(serviceAccount),
            });
            console.log('Firebase Admin: App initialized successfully');
        } catch (initError) {
            console.error('Firebase Admin: Failed to initialize app:', initError);
        }
    } else {
        // Avoid crashing on import, but usage will fail
        console.warn('Firebase Admin initialized without credentials (will fail on DB writes).');
    }
} else {
    console.log('Firebase Admin: App already exists, reusing');
}

// Export a robust getter or just the db instance (which might throw if not init)
// To prevent "default app does not exist" crash on import:
export const adminDb = getApps().length ? getFirestore() : {} as any;

console.log('Firebase Admin: adminDb initialized =', typeof adminDb.collection === 'function');
