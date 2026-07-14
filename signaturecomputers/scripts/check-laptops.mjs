import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

// Parse .env.local
const envPath = path.resolve('.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const config = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
        const key = match[1];
        let val = match[2] || '';
        if (val.startsWith('"') && val.endsWith('"')) {
            val = val.substring(1, val.length - 1);
        } else if (val.startsWith("'") && val.endsWith("'")) {
            val = val.substring(1, val.length - 1);
        }
        config[key] = val.trim();
    }
});

const firebaseConfig = {
    apiKey: config['NEXT_PUBLIC_FIREBASE_API_KEY'],
    authDomain: config['NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'],
    projectId: config['NEXT_PUBLIC_FIREBASE_PROJECT_ID'],
    storageBucket: config['NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'],
    messagingSenderId: config['NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'],
    appId: config['NEXT_PUBLIC_FIREBASE_APP_ID'],
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkLaptops() {
    console.log('Fetching laptops...');
    const snapshot = await getDocs(collection(db, 'laptops'));
    const laptops = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`Found ${laptops.length} laptops.`);
    laptops.forEach(l => {
        console.log(`ID: ${l.id} | Name: ${l.name} | Price: ${l.price} | Stock: ${l.stock}`);
    });
}

checkLaptops().catch(console.error);
