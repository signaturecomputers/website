//app/api/admin/products/delete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
    try {
        // Check admin authentication via Authorization header
        // The admin session is passed from the client side (stored in sessionStorage)
        const authHeader = request.headers.get('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Unauthorized - Admin login required' },
                { status: 401 }
            );
        }

        // Validate admin session from header
        try {
            const sessionToken = authHeader.replace('Bearer ', '');
            const session = JSON.parse(atob(sessionToken));

            if (!session.username || !session.role) {
                throw new Error('Invalid session');
            }

            // Only allow admin or staff roles
            if (session.role !== 'admin' && session.role !== 'staff') {
                throw new Error('Insufficient permissions');
            }
        } catch {
            return NextResponse.json(
                { error: 'Invalid admin session' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { category, productId } = body;

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

        // Delete the product using Firebase Admin SDK
        const productRef = adminDb.collection(category).doc(productId);

        // Check if product exists first
        const productDoc = await productRef.get();
        if (!productDoc.exists) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        // Delete the product
        await productRef.delete();

        console.log(`[Admin] Product deleted: ${category}/${productId}`);

        return NextResponse.json({
            success: true,
            message: 'Product deleted successfully'
        });

    } catch (error) {
        console.error('[Admin] Error deleting product:', error);
        return NextResponse.json(
            { error: 'Failed to delete product' },
            { status: 500 }
        );
    }
}
