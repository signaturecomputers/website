import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { QueryDocumentSnapshot, DocumentData } from "firebase-admin/firestore";

/**
 * GET /api/refund-requests
 * Fetch cancellation requests, return requests, or refunds using Admin SDK
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
        const type = searchParams.get('type') || 'cancellations';

        let collectionName = 'cancellation_requests';
        let orderByField = 'requestedAt';

        if (type === 'returns') {
            collectionName = 'return_requests';
            orderByField = 'requestedAt';
        } else if (type === 'refunds') {
            collectionName = 'refunds';
            orderByField = 'initiatedAt';
        }

        const snapshot = await adminDb
            .collection(collectionName)
            .orderBy(orderByField, 'desc')
            .limit(100)
            .get();

        const data = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
            const docData = doc.data();
            return {
                id: doc.id,
                type: type === 'cancellations' ? 'cancellation' : type === 'returns' ? 'return' : 'refund',
                ...docData,
                // Convert timestamps to ISO strings
                requestedAt: docData.requestedAt?.toDate?.()?.toISOString() || docData.requestedAt,
                processedAt: docData.processedAt?.toDate?.()?.toISOString() || docData.processedAt,
                initiatedAt: docData.initiatedAt?.toDate?.()?.toISOString() || docData.initiatedAt,
                completedAt: docData.completedAt?.toDate?.()?.toISOString() || docData.completedAt,
                createdAt: docData.createdAt?.toDate?.()?.toISOString() || docData.createdAt,
                updatedAt: docData.updatedAt?.toDate?.()?.toISOString() || docData.updatedAt,
            };
        });

        return NextResponse.json({ data });
    } catch (error) {
        console.error("Error fetching refund requests:", error);
        return NextResponse.json(
            { error: "Failed to fetch refund requests" },
            { status: 500 }
        );
    }
}
