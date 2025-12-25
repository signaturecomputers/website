//app/api/admin/products/delete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
    console.log('[Admin Delete] Request received');

    try {
        // Check admin authentication via Authorization header
        // The admin session is passed from the client side (stored in sessionStorage)
        const authHeader = request.headers.get('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('[Admin Delete] No auth header found');
            return NextResponse.json(
                { error: 'Unauthorized - Admin login required' },
                { status: 401 }
            );
        }

        // Validate admin session from header
        try {
            const sessionToken = authHeader.replace('Bearer ', '');
            const session = JSON.parse(atob(sessionToken));
            console.log('[Admin Delete] Session validated for user:', session.username);

            if (!session.username || !session.role) {
                throw new Error('Invalid session');
            }

            // Only allow admin or staff roles
            if (session.role !== 'admin' && session.role !== 'staff') {
                throw new Error('Insufficient permissions');
            }
        } catch (authError) {
            console.error('[Admin Delete] Auth validation failed:', authError);
            return NextResponse.json(
                { error: 'Invalid admin session' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { category, productId } = body;
        console.log('[Admin Delete] Attempting to delete:', { category, productId });

        if (!category || !productId) {
            return NextResponse.json(
                { error: 'Category and productId are required' },
                { status: 400 }
            );
        }

        if (category === 'all') {
            return NextResponse.json(
                { error: 'Cannot delete from "all" - specify a valid category' },
                { status: 400 }
            );
        }

        // Check if adminDb is properly initialized
        if (!adminDb || typeof adminDb.collection !== 'function') {
            console.error('[Admin Delete] Firebase Admin SDK not initialized properly');
            console.error('[Admin Delete] adminDb type:', typeof adminDb);
            console.error('[Admin Delete] Has collection method:', typeof adminDb?.collection);
            return NextResponse.json(
                { error: 'Server configuration error - Firebase Admin not initialized. Check FIREBASE_SERVICE_ACCOUNT_KEY environment variable.' },
                { status: 500 }
            );
        }

        // Delete the product using Firebase Admin SDK
        console.log('[Admin Delete] Getting document reference...');
        const productRef = adminDb.collection(category).doc(productId);

        // Check if product exists first
        console.log('[Admin Delete] Checking if product exists...');
        const productDoc = await productRef.get();
        if (!productDoc.exists) {
            console.log('[Admin Delete] Product not found');
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        // Delete the product
        console.log('[Admin Delete] Deleting product...');
        await productRef.delete();

        console.log(`[Admin Delete] Product deleted successfully: ${category}/${productId}`);

        return NextResponse.json({
            success: true,
            message: 'Product deleted successfully'
        });

    } catch (error: any) {
        console.error('[Admin Delete] Error:', error);
        console.error('[Admin Delete] Error message:', error?.message);
        console.error('[Admin Delete] Error stack:', error?.stack);
        return NextResponse.json(
            { error: `Failed to delete product: ${error?.message || 'Unknown error'}` },
            { status: 500 }
        );
    }
}
