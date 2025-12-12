import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const getServiceAccount = () => {
    try {
        const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
        if (!key) {
            console.warn('Warning: FIREBASE_SERVICE_ACCOUNT_KEY is missing in .env.local');
            return null;
        }
        return JSON.parse(key);
    } catch (error) {
        console.error('Error: FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON. Ensure keys are double-quoted. Example: {"type": "service_account", ...}');
        return null;
    }
};

const serviceAccount = getServiceAccount();

if (!getApps().length) {
    if (serviceAccount) {
        initializeApp({
            credential: cert(serviceAccount),
        });
    } else {
        // Avoid crashing on import, but usage will fail
        console.warn('Firebase Admin initialized without credentials (will fail on DB writes).');
        // We can try initializing with default creds (Google Cloud auto-discovery) if available, 
        // but typically locally this needs the key. 
        // For now, let's just not crash.
    }
}

// Export a robust getter or just the db instance (which might throw if not init)
// To prevent "default app does not exist" crash on import:
export const adminDb = getApps().length ? getFirestore() : {} as any; // Fallback to avoid import crash, essentially disabling adminDb
