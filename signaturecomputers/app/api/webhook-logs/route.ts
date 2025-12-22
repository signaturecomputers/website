import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { QueryDocumentSnapshot, DocumentData } from "firebase-admin/firestore";

/**
 * GET /api/webhook-logs
 * Fetch webhook logs using Admin SDK (bypasses security rules)
 */
export async function GET(request: NextRequest) {
    try {
        // Check if adminDb is properly initialized
        if (!adminDb || typeof adminDb.collection !== 'function') {
            return NextResponse.json(
                { error: "Database not configured" },
                { status: 500 }
            );
        }

        const { searchParams } = new URL(request.url);
        const limitParam = parseInt(searchParams.get('limit') || '50');

        const snapshot = await adminDb
            .collection('webhook_logs')
            .orderBy('receivedAt', 'desc')
            .limit(limitParam)
            .get();

        const logs = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
            id: doc.id,
            ...doc.data(),
            // Convert Firestore timestamps to ISO strings for JSON serialization
            receivedAt: doc.data().receivedAt?.toDate?.()?.toISOString() || doc.data().receivedAt,
            processedAt: doc.data().processedAt?.toDate?.()?.toISOString() || doc.data().processedAt,
        }));

        return NextResponse.json({ logs });
    } catch (error) {
        console.error("Error fetching webhook logs:", error);
        return NextResponse.json(
            { error: "Failed to fetch webhook logs" },
            { status: 500 }
        );
    }
}
