'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'sonner';

interface CartItem {
    id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    windowsInstallation?: boolean;
    windowsInstallationPrice?: number;
    stock?: number;
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
    addToCart: (item: CartItem) => boolean;
    removeFromCart: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    toggleWindowsInstallation: (itemId: string, windowsPrice?: number) => void;
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
    addToCart: () => false,
    removeFromCart: () => { },
    updateQuantity: () => { },
    toggleWindowsInstallation: () => { },
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

    // Save cart to Firestore (for logged-in users)
    const saveCart = useCallback(async (userId: string, items: CartItem[], saved: SavedItem[]) => {
        if (isSyncing.current) {
            console.log('[Cart] Skipping save - sync in progress');
            return;
        }

        try {
            // Filter out undefined values from cart items
            const cleanedItems = items.map(item => {
                const cleanedItem: any = { ...item };
                // Remove undefined fields
                Object.keys(cleanedItem).forEach(key => {
                    if (cleanedItem[key] === undefined) {
                        delete cleanedItem[key];
                    }
                });
                return cleanedItem;
            });

            const cleanedSavedItems = saved.map(item => {
                const cleanedItem: any = { ...item };
                // Remove undefined fields
                Object.keys(cleanedItem).forEach(key => {
                    if (cleanedItem[key] === undefined) {
                        delete cleanedItem[key];
                    }
                });
                return cleanedItem;
            });

            await setDoc(doc(db, 'carts', userId), {
                items: cleanedItems,
                savedItems: cleanedSavedItems,
                updatedAt: serverTimestamp()
            });
            console.log('[Cart] Saved to Firestore:', { itemCount: cleanedItems.length, savedCount: cleanedSavedItems.length });
        } catch (error) {
            console.error('[Cart] Error saving cart:', error);
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
                // Guest user on first mount - load from localStorage
                console.log('[Cart] Initial mount as guest');
                try {
                    const guestCart = localStorage.getItem('guest_cart');
                    if (guestCart) {
                        const parsedCart = JSON.parse(guestCart);
                        setCart(parsedCart);
                        console.log('[Cart] Loaded guest cart from localStorage:', parsedCart.length, 'items');
                    } else {
                        setCart([]);
                    }
                } catch (error) {
                    console.error('[Cart] Error loading guest cart:', error);
                    setCart([]);
                }
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

            // Get the current guest cart before it gets cleared
            const guestCart = [...cart];

            loadCart(currentUserId).then(({ items, savedItems: saved }) => {
                // Merge guest cart with user's saved cart
                let mergedCart = [...items];

                if (guestCart.length > 0) {
                    console.log('[Cart] Merging guest cart with user cart');
                    guestCart.forEach(guestItem => {
                        const existingIndex = mergedCart.findIndex(item => item.id === guestItem.id);
                        if (existingIndex >= 0) {
                            // Item exists, add quantities
                            mergedCart[existingIndex].quantity += guestItem.quantity;
                        } else {
                            // New item, add to cart
                            mergedCart.push(guestItem);
                        }
                    });

                    // Clear guest cart from localStorage after merge
                    localStorage.removeItem('guest_cart');
                }

                setCart(mergedCart);
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
            // Also clear any lingering guest cart
            localStorage.removeItem('guest_cart');
            setIsLoading(false);
            return;
        }

        prevUserIdRef.current = currentUserId;
    }, [user, loadCart, cart]);

    // Save cart to Firestore (logged-in users) or localStorage (guests)
    useEffect(() => {
        // Don't save if:
        // - Initial load not done
        // - Currently syncing (loading from Firestore)
        // - Still loading
        if (!initialLoadDone.current || isSyncing.current || isLoading) {
            return;
        }

        if (user) {
            // Logged-in user: save to Firestore
            console.log('[Cart] Cart changed, saving to Firestore...');
            saveCart(user.uid, cart, savedItems);
        } else {
            // Guest user: save to localStorage
            console.log('[Cart] Guest cart changed, saving to localStorage...');
            try {
                localStorage.setItem('guest_cart', JSON.stringify(cart));
            } catch (error) {
                console.error('[Cart] Error saving guest cart:', error);
            }
        }
    }, [cart, savedItems, user, isLoading, saveCart]);

    const addToCart = useCallback((item: CartItem) => {
        const stock = item.stock ?? 9999;
        let success = true;
        setCart((prev) => {
            const existing = prev.find((i) => i.id === item.id);
            const currentQuantityInCart = existing ? existing.quantity : 0;
            const totalRequested = currentQuantityInCart + item.quantity;

            if (totalRequested > stock) {
                toast.error(stock <= 0 ? 'Unavailable' : 'Out of quantity', {
                    description: stock <= 0 ? 'This product is out of stock.' : `Only ${stock} items available in stock.`,
                });
                success = false;
                return prev;
            }

            if (existing) {
                return prev.map((i) =>
                    i.id === item.id ? { ...i, quantity: totalRequested } : i
                );
            }
            return [...prev, item];
        });
        return success;
    }, []);

    const removeFromCart = useCallback((itemId: string) => {
        setCart((prev) => prev.filter((i) => i.id !== itemId));
    }, []);

    const updateQuantity = useCallback((itemId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(itemId);
            return;
        }
        setCart((prev) => prev.map((item) => {
            if (item.id === itemId) {
                const stock = item.stock ?? 9999;
                if (quantity > stock) {
                    toast.error(stock <= 0 ? 'Unavailable' : 'Out of quantity', {
                        description: stock <= 0 ? 'This product is out of stock.' : `Only ${stock} items available in stock.`,
                    });
                    return item;
                }
                return { ...item, quantity };
            }
            return item;
        }));
    }, [removeFromCart]);

    // Toggle Windows installation for cart item
    const toggleWindowsInstallation = useCallback((itemId: string, windowsPrice?: number) => {
        setCart((prev) => prev.map((item) => {
            if (item.id === itemId) {
                const hasWindows = item.windowsInstallation;
                return {
                    ...item,
                    windowsInstallation: !hasWindows,
                    windowsInstallationPrice: !hasWindows ? windowsPrice : undefined
                };
            }
            return item;
        }));
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

    const cartTotal = cart.reduce((total, item) => {
        const itemTotal = item.price * item.quantity;
        const windowsTotal = item.windowsInstallation && item.windowsInstallationPrice
            ? item.windowsInstallationPrice * item.quantity
            : 0;
        return total + itemTotal + windowsTotal;
    }, 0);
    const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cart,
            savedItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            toggleWindowsInstallation,
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
