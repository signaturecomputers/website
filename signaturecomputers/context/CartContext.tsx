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

interface SavedItem {
    id: string;
    name: string;
    price: number;
    image: string;
}

interface CartContextType {
    cart: CartItem[];
    savedItems: SavedItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;
    saveForLater: (item: SavedItem) => void;
    removeFromSaved: (itemId: string) => void;
    moveToCart: (item: SavedItem) => void;
    isInSaved: (itemId: string) => boolean;
    cartTotal: number;
    cartCount: number;
}

const CartContext = createContext<CartContextType>({
    cart: [],
    savedItems: [],
    addToCart: () => { },
    removeFromCart: () => { },
    updateQuantity: () => { },
    clearCart: () => { },
    saveForLater: () => { },
    removeFromSaved: () => { },
    moveToCart: () => { },
    isInSaved: () => false,
    cartTotal: 0,
    cartCount: 0,
});

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
    const { user } = useAuth();

    // Load cart and saved items from local storage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        const savedForLater = localStorage.getItem('savedItems');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
        if (savedForLater) {
            setSavedItems(JSON.parse(savedForLater));
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
        localStorage.setItem('savedItems', JSON.stringify(savedItems));
        if (user) {
            // Save to Firestore
            setDoc(doc(db, 'carts', user.uid), {
                items: cart,
                savedItems: savedItems
            }, { merge: true });
        }
    }, [cart, savedItems, user]);

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

    const saveForLater = (item: SavedItem) => {
        setSavedItems((prev) => {
            const existing = prev.find((i) => i.id === item.id);
            if (existing) return prev;
            return [...prev, item];
        });
    };

    const removeFromSaved = (itemId: string) => {
        setSavedItems((prev) => prev.filter((i) => i.id !== itemId));
    };

    const moveToCart = (item: SavedItem) => {
        // Remove from saved
        setSavedItems((prev) => prev.filter((i) => i.id !== item.id));
        // Add to cart
        addToCart({ ...item, quantity: 1 });
    };

    const isInSaved = (itemId: string) => {
        return savedItems.some((i) => i.id === itemId);
    };

    const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cart,
            savedItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            saveForLater,
            removeFromSaved,
            moveToCart,
            isInSaved,
            cartTotal,
            cartCount
        }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);
