import { useCallback, useEffect, useMemo, useState } from 'react';
import { products } from '@/data/products';
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
const getUnitPrice = (product, size) => product.sizes.find((option) => option.label === size)?.price ?? product.price;
export function CartProvider({ children }) {
    const [items, setItems] = useState(readStoredCart);
    const [isCartOpen, setIsCartOpen] = useState(false);
    useEffect(() => {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }, [items]);
    const enrichedItems = useMemo(() => (items
        .map((item) => {
        const product = products.find((entry) => entry.id === item.productId);
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
        .filter((item) => Boolean(item))), [items]);
    const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const total = enrichedItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const addItem = useCallback((product, size, quantity = 1) => {
        const chosenSize = size || product.sizes[0]?.label || defaultSize;
        setItems((current) => {
            const existing = current.find((item) => item.productId === product.id && item.size === chosenSize);
            if (!existing) {
                return [...current, { productId: product.id, size: chosenSize, quantity }];
            }
            return current.map((item) => (item.productId === product.id && item.size === chosenSize
                ? { ...item, quantity: item.quantity + quantity }
                : item));
        });
    }, []);
    const removeItem = useCallback((productId, size) => {
        setItems((current) => current.filter((item) => item.productId !== productId || item.size !== size));
    }, []);
    const updateQuantity = useCallback((productId, size, quantity) => {
        if (quantity <= 0) {
            setItems((current) => current.filter((item) => item.productId !== productId || item.size !== size));
            return;
        }
        setItems((current) => current.map((item) => (item.productId === productId && item.size === size
            ? { ...item, quantity }
            : item)));
    }, []);
    const clearCart = useCallback(() => setItems([]), []);
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
