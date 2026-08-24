import { Metadata } from 'next';
import { getProductById } from '@/lib/products';
import { checkDeletedProductServer } from '@/lib/products-server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ProductDetails from './ProductDetails';

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const product = await getProductById(id);

    if (!product) {
        const isDeleted = await checkDeletedProductServer(id);
        if (isDeleted) {
            return {
                title: 'Product No Longer Available | Signature Computers',
                description: 'This product has been discontinued and is no longer available at Signature Computers.',
                robots: { index: false, follow: false }
            };
        }
        return {
            title: 'Product Not Found',
            description: 'The requested product could not be found at Signature Computers, Egmore, Chennai.',
            robots: { index: false, follow: false }
        };
    }

    const title = `${product.productInfo?.title || product.name} Price in Chennai`;
    const description = product.description 
        ? product.description.substring(0, 155) + '...'
        : `Buy ${product.name} at Signature Computers in Egmore, Chennai. Best deals on laptops and desktops with warranty.`;

    return {
        title,
        description,
        robots: { index: true, follow: true },
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://signaturecomputers.in'}/product/${id}`
        }
    };
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

    return <ProductDetails id={id} />;
}
