"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAdminAuth } from "@/context/AdminAuthContext";

export default function AdminLogin() {
    const { gatewayVerified, login, loading: authLoading } = useAdminAuth();
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState(""); // Note: In real app, hash password! User requested simple string match per prompt.
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!authLoading && !gatewayVerified) {
            router.push("/");
        }
    }, [gatewayVerified, authLoading, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const usersRef = collection(db, "admin_users");
            const q = query(usersRef, where("username", "==", username));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                setError("Invalid credentials");
                setLoading(false);
                return;
            }

            let userFound = false;
            querySnapshot.forEach((doc) => {
                const userData = doc.data();
                if (userData.password === password) {
                    userFound = true;
                    login({
                        username: userData.username,
                        role: userData.role as "admin" | "staff",
                    });
                    router.push("/admindashboard");
                }
            });

            if (!userFound) {
                setError("Invalid credentials");
            }
        } catch (err) {
            console.error("Login error:", err);
            setError("Login failed. Check console.");
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || !gatewayVerified) {
        return null; // Or loading spinner. Effect will redirect.
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
                        <label className="block text-sm font-medium text-gray-400">Username</label>
                        <input
                            type="text"
                            required
                            className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400">Password</label>
                        <input
                            type="password"
                            required
                            className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
