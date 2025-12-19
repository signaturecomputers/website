'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { toast } from 'sonner';

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
    saveForLater: (item: SavedItem) => boolean;
    removeFromSaved: (itemId: string) => void;
    moveToCart: (item: SavedItem) => void;
    isInSaved: (itemId: string) => boolean;
    cartTotal: number;
    cartCount: number;
    isLoggedIn: boolean;
    isLoading: boolean;
}

const CartContext = createContext<CartContextType>({
    cart: [],
    savedItems: [],
    addToCart: () => { },
    removeFromCart: () => { },
    updateQuantity: () => { },
    clearCart: () => { },
    saveForLater: () => false,
    removeFromSaved: () => { },
    moveToCart: () => { },
    isInSaved: () => false,
    cartTotal: 0,
    cartCount: 0,
    isLoggedIn: false,
    isLoading: true,
});

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();

    // Track the previous user ID to detect login/logout transitions
    const prevUserIdRef = useRef<string | null | undefined>(undefined);
    // Track if initial load is done
    const initialLoadDone = useRef(false);
    // Track if we're currently syncing to avoid infinite loops
    const isSyncing = useRef(false);

    // Load cart from Firestore for the current user
    const loadCart = useCallback(async (userId: string) => {
        console.log('[Cart] Loading cart from Firestore for user:', userId);
        try {
            const docRef = doc(db, 'carts', userId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                console.log('[Cart] Loaded from Firestore:', {
                    itemCount: data.items?.length || 0,
                    savedCount: data.savedItems?.length || 0
                });
                return {
                    items: data.items || [],
                    savedItems: data.savedItems || []
                };
            } else {
                console.log('[Cart] No cart found in Firestore, starting fresh');
                return { items: [], savedItems: [] };
            }
        } catch (error) {
            console.error('[Cart] Error loading from Firestore:', error);
            return { items: [], savedItems: [] };
        }
    }, []);

    // Save cart to Firestore
    const saveCart = useCallback(async (userId: string, items: CartItem[], saved: SavedItem[]) => {
        if (isSyncing.current) {
            console.log('[Cart] Skipping save - sync in progress');
            return;
        }
        console.log('[Cart] Saving cart to Firestore for user:', userId, {
            itemCount: items.length,
            savedCount: saved.length
        });
        try {
            await setDoc(doc(db, 'carts', userId), {
                items: items,
                savedItems: saved,
                updatedAt: new Date().toISOString()
            });
            console.log('[Cart] Saved to Firestore successfully');
        } catch (error) {
            console.error('[Cart] Error saving to Firestore:', error);
        }
    }, []);

    // Handle user authentication state changes
    useEffect(() => {
        const currentUserId = user?.uid || null;
        const prevUserId = prevUserIdRef.current;

        console.log('[Cart] Auth state changed:', {
            currentUserId: currentUserId ? currentUserId.substring(0, 8) + '...' : null,
            prevUserId: prevUserId === undefined ? 'undefined' : (prevUserId ? prevUserId.substring(0, 8) + '...' : null),
            initialLoadDone: initialLoadDone.current
        });

        // First mount - determine initial state
        if (prevUserId === undefined) {
            prevUserIdRef.current = currentUserId;

            if (currentUserId) {
                // User is logged in on first mount (page refresh while logged in)
                console.log('[Cart] Initial mount with logged-in user');
                setIsLoading(true);
                isSyncing.current = true;
                loadCart(currentUserId).then(({ items, savedItems: saved }) => {
                    setCart(items);
                    setSavedItems(saved);
                    initialLoadDone.current = true;
                    isSyncing.current = false;
                    setIsLoading(false);
                });
            } else {
                // Guest user on first mount
                console.log('[Cart] Initial mount as guest');
                setCart([]);
                setSavedItems([]);
                initialLoadDone.current = true;
                setIsLoading(false);
            }
            return;
        }

        // User just logged in (transition from null to userId)
        if (currentUserId && prevUserId === null) {
            console.log('[Cart] User just logged in, loading their cart...');
            prevUserIdRef.current = currentUserId;
            setIsLoading(true);
            isSyncing.current = true;
            loadCart(currentUserId).then(({ items, savedItems: saved }) => {
                setCart(items);
                setSavedItems(saved);
                isSyncing.current = false;
                setIsLoading(false);
            });
            return;
        }

        // User just logged out (transition from userId to null)
        if (!currentUserId && prevUserId) {
            console.log('[Cart] User just logged out, clearing cart...');
            prevUserIdRef.current = null;
            setCart([]);
            setSavedItems([]);
            setIsLoading(false);
            return;
        }

        prevUserIdRef.current = currentUserId;
    }, [user, loadCart]);

    // Save cart to Firestore whenever it changes (only for logged-in users)
    useEffect(() => {
        // Don't save if:
        // - Initial load not done
        // - Currently syncing (loading from Firestore)
        // - Not logged in
        // - Still loading
        if (!initialLoadDone.current || isSyncing.current || !user || isLoading) {
            return;
        }

        console.log('[Cart] Cart changed, saving to Firestore...');
        saveCart(user.uid, cart, savedItems);
    }, [cart, savedItems, user, isLoading, saveCart]);

    const addToCart = useCallback((item: CartItem) => {
        setCart((prev) => {
            const existing = prev.find((i) => i.id === item.id);
            if (existing) {
                return prev.map((i) =>
                    i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
                );
            }
            return [...prev, item];
        });
    }, []);

    const removeFromCart = useCallback((itemId: string) => {
        setCart((prev) => prev.filter((i) => i.id !== itemId));
    }, []);

    const updateQuantity = useCallback((itemId: string, quantity: number) => {
        setCart((prev) =>
            prev.map((i) => (i.id === itemId ? { ...i, quantity: Math.max(1, quantity) } : i))
        );
    }, []);

    const clearCart = useCallback(() => {
        setCart([]);
    }, []);

    // Save for Later - ONLY works for logged-in users
    const saveForLater = useCallback((item: SavedItem): boolean => {
        if (!user) {
            toast.error('Please login to save items for later');
            return false;
        }
        setSavedItems((prev) => {
            const existing = prev.find((i) => i.id === item.id);
            if (existing) return prev;
            return [...prev, item];
        });
        return true;
    }, [user]);

    const removeFromSaved = useCallback((itemId: string) => {
        setSavedItems((prev) => prev.filter((i) => i.id !== itemId));
    }, []);

    const moveToCart = useCallback((item: SavedItem) => {
        setSavedItems((prev) => prev.filter((i) => i.id !== item.id));
        setCart((prev) => {
            const existing = prev.find((i) => i.id === item.id);
            if (existing) {
                return prev.map((i) =>
                    i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    }, []);

    const isInSaved = useCallback((itemId: string) => {
        return savedItems.some((i) => i.id === itemId);
    }, [savedItems]);

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
            cartCount,
            isLoggedIn: !!user,
            isLoading
        }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);
