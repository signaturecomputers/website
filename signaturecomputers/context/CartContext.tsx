'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface CartItem {
    id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;
    cartTotal: number;
    cartCount: number;
}

const CartContext = createContext<CartContextType>({
    cart: [],
    addToCart: () => { },
    removeFromCart: () => { },
    updateQuantity: () => { },
    clearCart: () => { },
    cartTotal: 0,
    cartCount: 0,
});

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const { user } = useAuth();

    // Load cart from local storage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    }, []);

    // Sync with Firestore when user logs in (simplified)
    useEffect(() => {
        if (user) {
            const syncCart = async () => {
                const docRef = doc(db, 'carts', user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    // Merge or replace logic here. For now, we'll just keep local if exists? 
                    // Better: fetch remote cart.
                    // setCart(docSnap.data().items); 
                }
            };
            syncCart();
        }
    }, [user]);

    // Save to local storage on change
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
        if (user) {
            // Save to Firestore
            setDoc(doc(db, 'carts', user.uid), { items: cart }, { merge: true });
        }
    }, [cart, user]);

    const addToCart = (item: CartItem) => {
        setCart((prev) => {
            const existing = prev.find((i) => i.id === item.id);
            if (existing) {
                return prev.map((i) =>
                    i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
                );
            }
            return [...prev, item];
        });
    };

    const removeFromCart = (itemId: string) => {
        setCart((prev) => prev.filter((i) => i.id !== itemId));
    };

    const updateQuantity = (itemId: string, quantity: number) => {
        setCart((prev) =>
            prev.map((i) => (i.id === itemId ? { ...i, quantity: Math.max(1, quantity) } : i))
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);
