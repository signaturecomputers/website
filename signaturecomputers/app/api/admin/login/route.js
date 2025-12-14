import { db } from "@/lib/firebaseClient";
import { doc, getDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { username, password } = await req.json();

        if (!username || !password) {
            return NextResponse.json(
                { error: "Missing credentials" },
                { status: 400 }
            );
        }

        // Firestore path: admin_users/admin
        const adminRef = doc(db, "admin_users", "admin");
        const adminSnap = await getDoc(adminRef);

        if (!adminSnap.exists()) {
            return NextResponse.json(
                { error: "Admin not found" },
                { status: 401 }
            );
        }

        const adminData = adminSnap.data();

        if (
            adminData.username !== username ||
            adminData.password !== password
        ) {
            return NextResponse.json(
                { error: "Invalid username or password" },
                { status: 401 }
            );
        }

        return NextResponse.json({
            success: true,
            role: adminData.role
        });

    } catch (err) {
        console.error("Admin login error:", err);
        return NextResponse.json(
            { error: "Server error" },
            { status: 500 }
        );
    }
}
