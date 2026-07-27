import { adminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { checkAdminAuthRateLimit, recordAdminAuthLoginAttempt, migratePlaintextPasswords } from "@/lib/admin-actions";

export async function POST(req) {
    try {
        const { username, password } = await req.json();

        if (!username || !password) {
            return NextResponse.json(
                { error: "Missing credentials" },
                { status: 400 }
            );
        }

        // Check rate limit first
        const rateLimit = await checkAdminAuthRateLimit(username);
        if (rateLimit.blocked) {
            return NextResponse.json(
                { error: `Too many failed attempts. Try again in ${Math.ceil((rateLimit.timeLeft || 0) / 60)} minutes.` },
                { status: 429 }
            );
        }

        // Migrate plaintext passwords if any exist
        await migratePlaintextPasswords();

        // Fetch user document from Firestore using Admin SDK
        const usersSnapshot = await adminDb.collection("admin_users")
            .where("username", "==", username)
            .get();

        if (usersSnapshot.empty) {
            await recordAdminAuthLoginAttempt(username, false);
            return NextResponse.json(
                { error: "Admin not found" },
                { status: 401 }
            );
        }

        let matchedUser = null;
        for (const docSnap of usersSnapshot.docs) {
            const adminData = docSnap.data();
            const storedPassword = adminData.password;

            // Only allow bcrypt check
            let isMatch = false;
            if (storedPassword && (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$'))) {
                isMatch = await bcrypt.compare(password, storedPassword);
            }

            if (isMatch) {
                matchedUser = { id: docSnap.id, ...adminData };
                break;
            }
        }

        if (!matchedUser) {
            await recordAdminAuthLoginAttempt(username, false);
            return NextResponse.json(
                { error: "Invalid username or password" },
                { status: 401 }
            );
        }

        // Clear failed attempts on success
        await recordAdminAuthLoginAttempt(username, true);

        return NextResponse.json({
            success: true,
            role: matchedUser.role
        });

    } catch (err) {
        console.error("Admin login error:", err);
        return NextResponse.json(
            { error: "Server error" },
            { status: 500 }
        );
    }
}
