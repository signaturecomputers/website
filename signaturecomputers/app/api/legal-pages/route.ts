import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { QueryDocumentSnapshot, DocumentData } from "firebase-admin/firestore";

/**
 * GET /api/legal-pages
 * Fetch all legal pages
 */
export async function GET() {
    try {
        if (!adminDb || typeof adminDb.collection !== 'function') {
            return NextResponse.json({ error: "Database not configured" }, { status: 500 });
        }

        const snapshot = await adminDb.collection('legal_pages').get();
        const pages = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
            id: doc.id,
            ...doc.data(),
            lastUpdated: doc.data().updatedAt?.toDate?.()?.toISOString() || null,
        }));

        return NextResponse.json({ pages });
    } catch (error) {
        console.error("Error fetching legal pages:", error);
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}

/**
 * POST /api/legal-pages
 * Save a legal page
 */
export async function POST(request: NextRequest) {
    try {
        if (!adminDb || typeof adminDb.collection !== 'function') {
            return NextResponse.json({ error: "Database not configured" }, { status: 500 });
        }

        const body = await request.json();
        const { id, title, content } = body;

        if (!id || !title) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await adminDb.collection('legal_pages').doc(id).set({
            id,
            title,
            content: content || '',
            updatedAt: new Date(),
        }, { merge: true });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error saving legal page:", error);
        return NextResponse.json({ error: "Failed to save" }, { status: 500 });
    }
}
