import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

/**
 * GET /api/admin/signature
 * Fetch the admin signature URL for invoices
 */
export async function GET() {
    try {
        const signatureDoc = await adminDb.collection("admin_settings").doc("invoice_signature").get();

        if (!signatureDoc.exists) {
            return NextResponse.json({ signatureUrl: null });
        }

        const data = signatureDoc.data();
        return NextResponse.json({
            signatureUrl: data?.signatureUrl || null
        });
    } catch (error) {
        console.error("Error fetching signature:", error);
        return NextResponse.json({ signatureUrl: null });
    }
}

/**
 * POST /api/admin/signature
 * Update the admin signature URL for invoices
 */
export async function POST(request: NextRequest) {
    try {
        const { signatureUrl } = await request.json();

        if (!signatureUrl) {
            return NextResponse.json(
                { error: "Signature URL is required" },
                { status: 400 }
            );
        }

        await adminDb.collection("admin_settings").doc("invoice_signature").set({
            signatureUrl,
            updatedAt: new Date()
        });

        return NextResponse.json({
            success: true,
            message: "Signature updated successfully"
        });
    } catch (error) {
        console.error("Error updating signature:", error);
        return NextResponse.json(
            { error: "Failed to update signature" },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/admin/signature
 * Remove the admin signature
 */
export async function DELETE() {
    try {
        await adminDb.collection("admin_settings").doc("invoice_signature").delete();

        return NextResponse.json({
            success: true,
            message: "Signature removed successfully"
        });
    } catch (error) {
        console.error("Error removing signature:", error);
        return NextResponse.json(
            { error: "Failed to remove signature" },
            { status: 500 }
        );
    }
}
