// Debug endpoint to check Firebase Admin SDK status
// DELETE THIS FILE AFTER DEBUGGING
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
    const base64Key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64;
    const regularKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    let base64Status = 'not set';
    let regularStatus = 'not set';
    let decodedPreview = '';
    let adminDbStatus = 'unknown';
    let testResult = 'not tested';

    // Check adminDb
    if (adminDb) {
        if (typeof adminDb.collection === 'function') {
            adminDbStatus = 'INITIALIZED - collection method available';

            // Try a simple operation
            try {
                const testRef = adminDb.collection('laptops').doc('test');
                await testRef.get();
                testResult = 'SUCCESS - Can read from Firestore';
            } catch (e: any) {
                testResult = `FAILED - ${e.message}`;
            }
        } else {
            adminDbStatus = 'NOT INITIALIZED - adminDb is empty object';
        }
    } else {
        adminDbStatus = 'NULL - adminDb is null/undefined';
    }

    if (base64Key) {
        base64Status = `set (${base64Key.length} chars)`;
        try {
            const decoded = Buffer.from(base64Key, 'base64').toString('utf-8');
            decodedPreview = decoded.substring(0, 100) + '...';

            // Try to parse it
            const parsed = JSON.parse(decoded);
            base64Status += ` - VALID JSON, project_id: ${parsed.project_id}`;
        } catch (e: any) {
            base64Status += ` - PARSE ERROR: ${e.message}`;
        }
    }

    if (regularKey) {
        regularStatus = `set (${regularKey.length} chars)`;
        if (regularKey.length < 100) {
            regularStatus += ' - TOO SHORT (likely truncated)';
        } else {
            try {
                const parsed = JSON.parse(regularKey);
                regularStatus += ` - VALID JSON, project_id: ${parsed.project_id}`;
            } catch (e: any) {
                regularStatus += ` - PARSE ERROR: ${e.message}`;
            }
        }
    }

    return NextResponse.json({
        message: 'Firebase Admin SDK Debug Info',
        adminDbStatus: adminDbStatus,
        testResult: testResult,
        FIREBASE_SERVICE_ACCOUNT_KEY_BASE64: base64Status,
        FIREBASE_SERVICE_ACCOUNT_KEY: regularStatus,
        decodedPreview: decodedPreview,
        timestamp: new Date().toISOString()
    });
}
