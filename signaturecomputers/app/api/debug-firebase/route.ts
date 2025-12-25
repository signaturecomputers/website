// Debug endpoint to check Firebase Admin SDK status
// DELETE THIS FILE AFTER DEBUGGING
import { NextResponse } from 'next/server';

export async function GET() {
    const base64Key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64;
    const regularKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    let base64Status = 'not set';
    let regularStatus = 'not set';
    let decodedPreview = '';

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
        FIREBASE_SERVICE_ACCOUNT_KEY_BASE64: base64Status,
        FIREBASE_SERVICE_ACCOUNT_KEY: regularStatus,
        decodedPreview: decodedPreview,
        timestamp: new Date().toISOString()
    });
}
