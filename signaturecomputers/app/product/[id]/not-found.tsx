import Link from 'next/link';

export default function ProductNotFound() {
    return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Product Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                The product you are looking for does not exist or has been removed from our catalog.
            </p>
            <Link
                href="/products"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
                Browse All Products
            </Link>
        </div>
    );
}
