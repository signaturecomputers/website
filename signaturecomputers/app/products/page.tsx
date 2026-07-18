import { getAllProductsServer } from '@/lib/products-server';
import ProductsClient from './ProductsClient';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

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
            'power-adapters', 'bags', 'docks', 'hubs', 'usb-flashdrives', 'dvd-writers',
            'webcams', 'others'
        ];
        const memoryStorageSubcategories = ['memory', 'storage', 'graphics-cards'];

        const getProductCategory = (p: any) => {
            if (p.category?.toLowerCase() === 'dvd-writers') {
                if (p.productInfo?.othersType === 'webcam') return 'webcams';
                if (p.productInfo?.othersType === 'other') return 'others';
                return 'dvd-writers';
            }
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
            initialProducts={products}
            initialCategory={category}
            initialSearch={search}
        />
    );
}
