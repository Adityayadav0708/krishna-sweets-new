import { useCallback, useEffect, useMemo, useState } from 'react';
import { products } from '@/data/products';
import { useAuth } from '@/context/AuthContext';
import { cartService } from '@/services/cartService';
import { productService, adaptProduct } from '@/services/productService';
import { CartContext } from './CartContext';

const STORAGE_KEY = 'krishna-sweets-cart';
const defaultSize = '500g';

const isCartLine = (value) => {
    if (!value || typeof value !== 'object')
        return false;
    const line = value;
    return (typeof line.productId === 'string' &&
        typeof line.size === 'string' &&
        typeof line.quantity === 'number' &&
        Number.isFinite(line.quantity) &&
        line.quantity > 0);
};

const readStoredCart = () => {
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (!stored)
            return [];
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed.filter(isCartLine) : [];
    }
    catch {
        return [];
    }
};

const getUnitPrice = (product, size) => {
    if (Array.isArray(product.sizes) && product.sizes.length > 0) {
        return product.sizes.find((option) => option.label === size)?.price ?? product.price;
    }
    return product.price;
};

export function CartProvider({ children }) {
    const { user } = useAuth();
    const [items, setItems] = useState(readStoredCart);
    const [catalogProducts, setCatalogProducts] = useState(products);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Load live catalog products for item enrichment
    useEffect(() => {
        let mounted = true;
        productService.getProducts().then((data) => {
            if (mounted && Array.isArray(data) && data.length > 0) {
                setCatalogProducts(data);
            }
        });
        return () => {
            mounted = false;
        };
    }, []);

    // Save to localStorage whenever items change
    useEffect(() => {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }, [items]);

    // Fetch and merge MongoDB cart when user logs in
    useEffect(() => {
        if (!user) return;

        let mounted = true;
        cartService.getMyCart().then((backendItems) => {
            if (!mounted || !Array.isArray(backendItems)) return;

            if (backendItems.length > 0) {
                // Map backend cart items to client shape
                const mapped = backendItems.map((bi) => {
                    const prodObj = typeof bi.productId === 'object' && bi.productId
                        ? adaptProduct(bi.productId)
                        : null;
                    const pid = prodObj ? (prodObj.id || prodObj._id) : String(bi.productId);
                    return {
                        productId: pid,
                        size: bi.size || defaultSize,
                        quantity: bi.quantity,
                        product: prodObj,
                    };
                });

                setItems(mapped);
            } else if (items.length > 0) {
                // If backend cart is empty but user had items in local cart, sync them up
                items.forEach((item) => {
                    cartService.addToCart({
                        productId: item.productId,
                        size: item.size,
                        quantity: item.quantity,
                    });
                });
            }
        });

        return () => {
            mounted = false;
        };
    }, [user]);

    const enrichedItems = useMemo(() => (items
        .map((item) => {
            const product =
                item.product ||
                catalogProducts.find((entry) => entry.id === item.productId || entry._id === item.productId) ||
                products.find((entry) => entry.id === item.productId || entry._id === item.productId);

            if (!product)
                return null;

            const unitPrice = getUnitPrice(product, item.size);
            return {
                ...item,
                product,
                unitPrice,
                lineTotal: unitPrice * item.quantity,
            };
        })
        .filter(Boolean)), [items, catalogProducts]);

    const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const total = enrichedItems.reduce((sum, item) => sum + item.lineTotal, 0);

    const addItem = useCallback((product, size, quantity = 1) => {
        const chosenSize = size || product.sizes?.[0]?.label || defaultSize;
        const productId = product.id || product._id;

        setItems((current) => {
            const existing = current.find((item) => item.productId === productId && item.size === chosenSize);
            if (!existing) {
                return [...current, { productId, size: chosenSize, quantity, product }];
            }
            return current.map((item) => (item.productId === productId && item.size === chosenSize
                ? { ...item, quantity: item.quantity + quantity, product }
                : item));
        });

        // Sync with backend if logged in
        if (user) {
            cartService.addToCart({ productId, size: chosenSize, quantity }).catch(console.warn);
        }
    }, [user]);

    const removeItem = useCallback((productId, size) => {
        setItems((current) => current.filter((item) => !(item.productId === productId && item.size === size)));

        if (user) {
            cartService.removeItem({ productId, size }).catch(console.warn);
        }
    }, [user]);

    const updateQuantity = useCallback((productId, size, quantity) => {
        if (quantity <= 0) {
            setItems((current) => current.filter((item) => !(item.productId === productId && item.size === size)));
            if (user) {
                cartService.removeItem({ productId, size }).catch(console.warn);
            }
            return;
        }

        setItems((current) => current.map((item) => (item.productId === productId && item.size === size
            ? { ...item, quantity }
            : item)));

        if (user) {
            cartService.updateQuantity({ productId, size, quantity }).catch(console.warn);
        }
    }, [user]);

    const clearCart = useCallback(() => {
        setItems([]);
        if (user) {
            cartService.clearCart().catch(console.warn);
        }
    }, [user]);

    const openCart = useCallback(() => setIsCartOpen(true), []);
    const closeCart = useCallback(() => setIsCartOpen(false), []);

    const value = useMemo(() => ({
        items,
        enrichedItems,
        totalCount,
        total,
        isCartOpen,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        openCart,
        closeCart,
    }), [
        addItem,
        clearCart,
        closeCart,
        enrichedItems,
        isCartOpen,
        items,
        openCart,
        removeItem,
        total,
        totalCount,
        updateQuantity,
    ]);

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
