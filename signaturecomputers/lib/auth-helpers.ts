import { User } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export const createFirestoreUser = async (user: User, provider: 'google' | 'password', name?: string) => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        // Create new user document
        await setDoc(userRef, {
            uid: user.uid,
            name: name || user.displayName || 'Anonymous',
            email: user.email,
            provider,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
        });
    } else {
        // Update last login
        await updateDoc(userRef, {
            lastLogin: new Date().toISOString(),
        });
    }
};
