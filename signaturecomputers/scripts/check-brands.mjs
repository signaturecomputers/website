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

const COLLECTIONS = [
    'laptops', 'desktops', 'monitors', 'accessories', 'memory', 'storage', 'graphics-cards',
    'keyboards', 'mouse', 'keyboard-mouse-combo', 'headphones', 'cables',
    'power-adapters', 'bags', 'docks', 'hubs', 'usb-flashdrives', 'dvd-writers',
    'workstations', 'cctv'
];

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkBrands() {
    console.log('Checking all products for brands...');
    let totalCount = 0;
    const competitorProducts = [];

    for (const col of COLLECTIONS) {
        try {
            const snapshot = await getDocs(collection(db, col));
            snapshot.docs.forEach(doc => {
                totalCount++;
                const data = doc.data();
                const brand = (data.brand || '').toLowerCase().trim();
                if (brand && brand !== 'hp' && brand !== 'hewlett packard' && brand !== 'hewlett-packard') {
                    competitorProducts.push({
                        collection: col,
                        id: doc.id,
                        name: data.name,
                        brand: data.brand
                    });
                }
            });
        } catch (e) {
            // Ignore missing collections
        }
    }

    console.log(`Total products scanned: ${totalCount}`);
    console.log(`Competitor products found: ${competitorProducts.length}`);
    competitorProducts.forEach(p => {
        console.log(`Col: ${p.collection} | ID: ${p.id} | Name: ${p.name} | Brand: ${p.brand}`);
    });
}

checkBrands().catch(console.error);
