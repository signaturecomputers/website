"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { Save, AlertTriangle } from "lucide-react";

export default function AdminSettings() {
    const { adminUser } = useAdminAuth();
    const [currentKey, setCurrentKey] = useState("••••••••");
    const [newKey, setNewKey] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        // Optionally fetch the current key to show it (not recommended for security, but allowed for admin)
        // Or just allow setting a new one.
        // Let's fetch it to show it masked maybe?
        // Actually, prompt says "Page to update admin access key".
    }, []);

    const handleUpdateKey = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newKey || newKey.length < 5) {
            setMessage({ type: "error", text: "Key must be at least 5 characters." });
            return;
        }

        if (adminUser?.role !== "admin") {
            setMessage({ type: "error", text: "Only ADMIN Role can change the access key." });
            return;
        }

        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
            const docRef = doc(db, "admin_settings", "admin_access_key");
            const docSnap = await getDoc(docRef);

            const data = {
                key: newKey,
                updatedBy: adminUser.username,
                updatedAt: Timestamp.now(),
            };

            if (docSnap.exists()) {
                await updateDoc(docRef, data);
            } else {
                await setDoc(docRef, data);
            }

            setMessage({ type: "success", text: "Access Key updated successfully!" });
            setNewKey("");
        } catch (err) {
            console.error("Error updating key:", err);
            setMessage({ type: "error", text: "Failed to update key." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Admin Settings</h1>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <AlertTriangle className="mr-2 text-yellow-500" size={20} />
                    Admin Access Configuration
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    This key is used to access the login gateway. Changing this will immediately revoke access for anyone using the old link.
                </p>

                {message.text && (
                    <div className={`mb-4 p-4 rounded-lg ${message.type === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleUpdateKey} className="space-y-4 max-w-md">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Access Key</label>
                        <input
                            type="text"
                            value={newKey}
                            onChange={(e) => setNewKey(e.target.value)}
                            placeholder="Enter new secret key"
                            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || adminUser?.role !== "admin"}
                        className="flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save className="mr-2 h-4 w-4" />
                        {loading ? "Updating..." : "Update Access Key"}
                    </button>

                    {adminUser?.role !== "admin" && (
                        <p className="text-xs text-red-500 mt-2">You need ADMIN privileges to perform this action.</p>
                    )}
                </form>
            </div>
        </div>
    );
}
