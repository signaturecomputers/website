import { adminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req) {
    try {
        const { username, password } = await req.json();

        if (!username || !password) {
            return NextResponse.json(
                { error: "Missing credentials" },
                { status: 400 }
            );
        }

        // Fetch user document from Firestore using Admin SDK
        const usersSnapshot = await adminDb.collection("admin_users")
            .where("username", "==", username)
            .get();

        if (usersSnapshot.empty) {
            return NextResponse.json(
                { error: "Admin not found" },
                { status: 401 }
            );
        }

        let matchedUser = null;
        for (const docSnap of usersSnapshot.docs) {
            const adminData = docSnap.data();
            const storedPassword = adminData.password;

            let isMatch = false;
            if (storedPassword && (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$'))) {
                isMatch = await bcrypt.compare(password, storedPassword);
            } else {
                if (storedPassword === password) {
                    isMatch = true;
                    // Auto-hash and save plaintext password
                    try {
                        const hashedPassword = await bcrypt.hash(password, 10);
                        await adminDb.collection("admin_users").doc(docSnap.id).update({
                            password: hashedPassword
                        });
                        console.log(`[API Auth] Plaintext password for ${username} has been auto-hashed.`);
                    } catch (hashErr) {
                        console.error("[API Auth] Failed to hash plaintext password:", hashErr);
                    }
                }
            }

            if (isMatch) {
                matchedUser = { id: docSnap.id, ...adminData };
                break;
            }
        }

        if (!matchedUser) {
            return NextResponse.json(
                { error: "Invalid username or password" },
                { status: 401 }
            );
        }

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
