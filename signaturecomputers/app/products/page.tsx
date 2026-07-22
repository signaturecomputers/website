import { Metadata } from 'next';
import { categoryIntros } from '@/lib/categoryContent';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { getAllProductsServer } from '@/lib/products-server';
import ProductsClient from './ProductsClient';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export async function generateMetadata(props: {
    searchParams: SearchParams;
}): Promise<Metadata> {
    const searchParams = await props.searchParams;
    const category = typeof searchParams.category === 'string' ? searchParams.category : '';

    if (!category || category.toLowerCase() === 'all') {
        return {
            title: 'Shop All HP Products | Signature Computers, Egmore, Chennai',
            description: 'Shop our full range of HP laptops, desktops, workstations, monitors, and premium computer accessories at Signature Computers, Egmore, Chennai. Enjoy official manufacturer warranty and doorstep support.',
            alternates: {
                canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://signaturecomputers.in'}/products`
            }
        };
    }

    const catSlug = category.toLowerCase();
    
    // Custom mapping for display names
    const categoryNames: Record<string, string> = {
        'laptops': 'Laptops',
        'desktops': 'Desktops',
        'workstations': 'Workstations',
        'monitors': 'Monitors',
        'memory': 'Memory',
        'storage': 'Storage',
        'graphics-cards': 'Graphics Cards',
        'accessories': 'Accessories',
        'keyboards': 'Keyboards',
        'mouse': 'Mouse',
        'keyboard-mouse-combo': 'Keyboard & Mouse Combo',
        'headphones': 'Headphones',
        'cables': 'Cables',
        'power-adapters': 'Power Adapters',
        'adapters': 'Power Adapters',
        'bags': 'Bags',
        'docks': 'Docks',
        'hubs': 'Hubs',
        'usb-flashdrives': 'USB Flash Drives',
        'dvd-writers': 'DVD Writers',
        'webcams': 'Webcams',
        'cctv': 'CCTV',
        'memory-storage': 'Memory & Storage',
        'memory-storage-all': 'Memory & Storage'
    };

    // Get display name
    let categoryName = categoryNames[catSlug] || category.charAt(0).toUpperCase() + category.slice(1);

    // Fetch custom category name dynamically from category_metadata, matching category/[slug]/page.tsx
    try {
        const docRef = doc(db, 'category_metadata', catSlug);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.name && !data.deleted) {
                categoryName = data.name;
            }
        }
    } catch (error) {
        console.error('Error fetching category metadata for SEO in products page:', error);
    }

    // Generate title: "[Category Name] in Egmore, Chennai | Signature Computers"
    const title = `${categoryName} in Egmore, Chennai | Signature Computers`;

    // Generate unique description: 1-2 sentence description per category mentioning the category and location.
    // Support adapters pointing to power-adapters intro
    const lookupSlug = catSlug === 'adapters' ? 'power-adapters' : catSlug;
    
    let description = '';
    if (categoryIntros[lookupSlug]) {
        description = categoryIntros[lookupSlug];
    } else {
        description = `Shop HP ${categoryName.toLowerCase()} in Egmore, Chennai at Signature Computers — genuine products with official warranty and doorstep delivery.`;
    }

    // Cut to 150 chars if too long, matching app/category/[slug]/page.tsx
    if (description.length > 150) {
        description = description.substring(0, 150) + '...';
    }

    return {
        title,
        description,
        robots: { index: true, follow: true },
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://signaturecomputers.in'}/products?category=${catSlug}`
        }
    };
}

export default async function ProductsPage(props: {
    searchParams: SearchParams;
}) {
    const searchParams = await props.searchParams;
    const category = typeof searchParams.category === 'string' ? searchParams.category : 'all';
    const search = typeof searchParams.search === 'string' ? searchParams.search : '';

    // Fetch all products server-side using firebase-admin
    let products = await getAllProductsServer();

    // Apply Search Filter server-side
    if (search) {
        const searchTerm = search.toLowerCase();
        products = products.filter(product => {
            const productName = product.name?.toLowerCase() || '';
            const productBrand = product.brand?.toLowerCase() || '';
            return productName.includes(searchTerm) || productBrand.includes(searchTerm);
        });
    }

    // Apply Category Filter server-side
    if (category !== 'all') {
        const accessorySubcategories = [
            'keyboards', 'mouse', 'keyboard-mouse-combo', 'headphones', 'cables',
            'power-adapters', 'bags', 'docks', 'hubs', 'usb-flashdrives', 'dvd-writers'
        ];
        const memoryStorageSubcategories = ['memory', 'storage', 'graphics-cards'];

        const getProductCategory = (p: any) => {
            return p.category?.toLowerCase();
        };

        if (category === 'accessories') {
            products = products.filter(p =>
                getProductCategory(p) === 'accessories' || accessorySubcategories.includes(getProductCategory(p) || '')
            );
        } else if (category === 'memory-storage' || category === 'memory-storage-all') {
            products = products.filter(p => memoryStorageSubcategories.includes(getProductCategory(p) || ''));
        } else {
            products = products.filter(p => getProductCategory(p) === category.toLowerCase());
        }
    }

    return (
        <ProductsClient 
            key={`${category}_${search}`}
            initialProducts={products}
            initialCategory={category}
            initialSearch={search}
        />
    );
}
