import { getProductById } from '@/lib/products';
import { checkDeletedProductServer } from '@/lib/products-server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ProductDetails from './ProductDetails';
import ProductSchema from '@/components/seo/ProductSchema';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ProductDetailsPage({ params }: PageProps) {
    const { id } = await params;
    const product = await getProductById(id);

    if (!product) {
        const isDeleted = await checkDeletedProductServer(id);
        if (isDeleted) {
            return (
                <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16">
                    <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                        410
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Product No Longer Available</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
                        This product has been discontinued or removed from our inventory and is no longer available.
                    </p>
                    <Link
                        href="/products"
                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-md"
                    >
                        Browse All Products
                    </Link>
                </div>
            );
        }
        notFound();
    }

    return <>
        <ProductSchema product={product} />
        <ProductDetails id={id} />
    </>;
}
