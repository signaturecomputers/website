import { User } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export async function createFirestoreUser(
    user: User,
    provider: 'password' | 'google',
    displayName?: string,
    additionalData?: any
) {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        const userData = {
            uid: user.uid,
            email: user.email,
            displayName: displayName || user.displayName || 'User',
            photoURL: user.photoURL || '',
            provider,
            role: 'customer',
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
            ...additionalData // Merge first name, last name, phone
        };

        try {
            await setDoc(userRef, userData);
        } catch (error) {
            console.error("Error creating Firestore user:", error);
        }
    } else {
        // Update last login
        await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
    }
};
