'use client';

import { useRouter } from 'next/navigation';
import { FiShoppingCart, FiHeart } from 'react-icons/fi';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

interface Product {
    id: string;
    name: string;
    brand: string;
    price: number;
    originalPrice?: number;
    image: string;
    rating?: number;
    stock?: number;
}

interface ProductCardProps {
    product: Product;
    onClick?: () => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
    const router = useRouter();
    const { addToCart, saveForLater, isInSaved } = useCart();

    const isSaved = isInSaved(product.id);

    const handleCardClick = () => {
        if (onClick) {
            onClick();
        } else {
            router.push(`/product/${product.id}`);
        }
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        const success = addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1,
            stock: product.stock,
        });
        if (success) {
            toast.success('Added to cart!', {
                description: product.name,
            });
        }
    };

    const handleSaveForLater = (e: React.MouseEvent) => {
        e.stopPropagation();
        const success = saveForLater({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
        });
        if (success) {
            toast.success(isSaved ? 'Already saved!' : 'Saved for later!', {
                description: product.name,
            });
        }
        // If not successful, toast error is already shown by CartContext
    };

    return (
        <div
            onClick={handleCardClick}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-sm hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-800 overflow-hidden group cursor-pointer"
        >
            <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
                {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 pointer-events-none">
                        <div className="absolute w-[150%] py-1.5 bg-red-800/85 text-white/90 font-semibold text-[10px] md:text-xs uppercase tracking-widest text-center rotate-[-45deg] shadow-md border-y border-white/10">
                            Out of Stock
                        </div>
                    </div>
                )}
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                    {product.image ? (
                        <img src={product.image} alt={product.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform" />
                    ) : (
                        <span className="text-sm">No Image</span>
                    )}
                </div>
                <button
                    onClick={handleSaveForLater}
                    className={`absolute top-2 right-2 p-2 rounded-full transition-colors shadow-sm ${isSaved
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-white/80 hover:bg-white text-gray-500 hover:text-red-500 dark:bg-black/50 dark:text-white'
                        }`}
                >
                    <FiHeart className={isSaved ? 'fill-current' : ''} />
                </button>
            </div>

            <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {product.name}
                </h3>
                <div className="flex items-center justify-between mt-4">
                    {product.stock === 0 ? (
                        <span className="text-xs font-semibold text-red-800 dark:text-red-500 uppercase tracking-wider">Out of Stock</span>
                    ) : (
                        <div className="flex flex-col">
                            <span className="text-lg font-bold text-gray-900 dark:text-white">₹{product.price.toLocaleString('en-IN')}</span>
                            {product.originalPrice && (
                                <span className="text-xs text-gray-500 line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                            )}
                        </div>
                    )}
                    {product.stock !== 0 && (
                        <button
                            onClick={handleAddToCart}
                            className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors dark:bg-blue-900 dark:text-blue-200"
                        >
                            <FiShoppingCart />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
