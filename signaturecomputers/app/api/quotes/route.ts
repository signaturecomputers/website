import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { QueryDocumentSnapshot, DocumentData } from "firebase-admin/firestore";

/**
 * GET /api/quotes
 * Fetch all quote requests
 */
export async function GET() {
    try {
        if (!adminDb || typeof adminDb.collection !== 'function') {
            return NextResponse.json({ error: "Database not configured" }, { status: 500 });
        }

        const snapshot = await adminDb
            .collection('quote_requests')
            .orderBy('createdAt', 'desc')
            .limit(100)
            .get();

        const quotes = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        }));

        return NextResponse.json({ quotes });
    } catch (error) {
        console.error("Error fetching quotes:", error);
        return NextResponse.json({ error: "Failed to fetch quotes" }, { status: 500 });
    }
}

/**
 * POST /api/quotes
 * Create a new quote request
 */
export async function POST(request: NextRequest) {
    try {
        if (!adminDb || typeof adminDb.collection !== 'function') {
            return NextResponse.json({ error: "Database not configured" }, { status: 500 });
        }

        const body = await request.json();
        const { name, email, phone, companyName, category, productDetails, quantity, additionalInfo, message } = body;

        if (!name || !email || !phone || !category || !productDetails || !quantity) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const quoteId = `QR-${Date.now()}`;
        const quoteData = {
            id: quoteId,
            name,
            email,
            phone,
            companyName: companyName || null,
            category,
            productDetails,
            quantity: Number(quantity),
            additionalInfo: additionalInfo || {},
            message: message || null,
            status: 'pending',
            createdAt: new Date(),
        };

        await adminDb.collection('quote_requests').doc(quoteId).set(quoteData);

        // Send email notification to admin
        try {
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
            await fetch(`${appUrl}/api/email/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'quote_request',
                    data: quoteData,
                }),
            });
        } catch (emailError) {
            console.error('Failed to send quote notification email:', emailError);
        }

        return NextResponse.json({ success: true, quoteId });
    } catch (error) {
        console.error("Error creating quote:", error);
        return NextResponse.json({ error: "Failed to create quote" }, { status: 500 });
    }
}

/**
 * PATCH /api/quotes
 * Update quote status
 */
export async function PATCH(request: NextRequest) {
    try {
        if (!adminDb || typeof adminDb.collection !== 'function') {
            return NextResponse.json({ error: "Database not configured" }, { status: 500 });
        }

        const body = await request.json();
        const { id, status } = body;

        if (!id || !status) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await adminDb.collection('quote_requests').doc(id).update({
            status,
            updatedAt: new Date(),
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating quote:", error);
        return NextResponse.json({ error: "Failed to update quote" }, { status: 500 });
    }
}
