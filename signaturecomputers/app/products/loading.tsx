'use client';

export default function ProductsLoading() {
    return (
        <div className="bg-gray-50 dark:bg-black min-h-screen flex flex-col items-center justify-center py-16">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Loading products...</p>
        </div>
    );
}
