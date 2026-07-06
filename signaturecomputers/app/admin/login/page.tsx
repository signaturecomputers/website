"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { adminAuth } from "@/lib/firebaseAdmin";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { createAdminUserIfNeeded } from "@/lib/admin-actions";

export default function AdminLogin() {
    const { gatewayVerified, login, loading: authLoading } = useAdminAuth();
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!authLoading && !gatewayVerified) {
            router.push("/");
        }
    }, [gatewayVerified, authLoading, router]);

    // Sign out from admin auth on mount to ensure clean state
    useEffect(() => {
        signOut(adminAuth).catch(() => { });
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // Firebase Auth login
            const userCredential = await signInWithEmailAndPassword(adminAuth, email, password);
            const user = userCredential.user;

            let role: "admin" | "staff" = "staff"; // Default role
            let displayName = user.email?.split("@")[0] || "Admin";

            // Call server action to check/create user in admin_users (secure, service account)
            const result = await createAdminUserIfNeeded(user.uid, user.email || "", displayName);

            if (!result.success) {
                await signOut(adminAuth);
                setError(result.error || "Access denied. Failed to check admin record.");
                setLoading(false);
                return;
            }

            role = result.role as "admin" | "staff";
            displayName = result.username || displayName;

            // Verify role is either admin or staff
            if (role !== "admin" && role !== "staff") {
                await signOut(adminAuth);
                setError("Access denied. Invalid role assignment.");
                setLoading(false);
                return;
            }


            // Sign out from Firebase Auth immediately after validation
            // We only use Firebase for credential verification, not for persistent auth state
            await signOut(adminAuth);

            // Update context (session-based, not Firebase auth state)
            login({
                username: displayName,
                role: role as "admin" | "staff",
            });

            router.push("/admindashboard");

        } catch (err: any) {
            console.error("Login error:", err);

            // Make sure to sign out on any error
            await signOut(adminAuth).catch(() => { });

            // Handle specific Firebase Auth errors
            switch (err.code) {
                case "auth/invalid-email":
                    setError("Invalid email address");
                    break;
                case "auth/user-not-found":
                    setError("No account found with this email");
                    break;
                case "auth/wrong-password":
                    setError("Incorrect password");
                    break;
                case "auth/invalid-credential":
                    setError("Invalid email or password");
                    break;
                case "auth/too-many-requests":
                    setError("Too many failed attempts. Try again later.");
                    break;
                default:
                    setError(err.message || "Login failed");
            }
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || !gatewayVerified) {
        return null;
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-900 px-4">
            <div className="w-full max-w-md rounded-lg bg-gray-800 p-8 shadow-xl">
                <h2 className="mb-6 text-center text-3xl font-bold text-white">Admin Login</h2>

                {error && (
                    <div className="mb-4 rounded bg-red-500/20 p-3 text-sm text-red-200 border border-red-500/50">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Email</label>
                        <input
                            type="email"
                            required
                            placeholder="admin@example.com"
                            className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400">Password</label>
                        <input
                            type="password"
                            required
                            placeholder="••••••••"
                            className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>
            </div>
        </div>
    );
}
