// Admin Firebase exports
// Uses same Firebase instance but auth state is managed via sessionStorage in AdminAuthContext
// We sign out immediately after credential verification, so auth state doesn't persist

import { auth, db } from "@/lib/firebase";
import { setPersistence, inMemoryPersistence } from "firebase/auth";

// Set admin auth to use in-memory persistence (no localStorage/indexedDB)
// This means auth state is lost on page refresh - which is what we want
if (typeof window !== "undefined") {
    setPersistence(auth, inMemoryPersistence).catch(console.error);
}

// Re-export for admin use
export const adminAuth = auth;
export const adminDb = db;

