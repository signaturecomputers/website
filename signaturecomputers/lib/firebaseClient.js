import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBALdcqTUVjJutWxcIACOVob-hxInBVA",
    authDomain: "signature-40484.firebaseapp.com",
    projectId: "signature-40484",
    storageBucket: "signature-40484.appspot.com",
    messagingSenderId: "763537218668",
    appId: "1:763537218668:web:db2b9483a4f05e6f968c49",
    measurementId: "G-4ZWGEGDQR9"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
