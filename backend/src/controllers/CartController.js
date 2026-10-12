import Cart from "../models/Cart.js";



// Add items to Cart
const addTocart = async (req, res) => {
    try {
        // Derive userId securely from authenticated user session
        const userId = req.userId || req.user?.id || req.user?._id;
        const { productId, size = "500g", quantity = 1 } = req.body;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized", success: false, error: true });
        }

        if (!productId) {
            return res.status(400).json({ message: "Product ID is required", success: false, error: true });
        }

        // Check user cart in db with same user id
        let cart = await Cart.findOne({ userId });

        // If this user doesn't already have a cart, create a new one.
        if (!cart) {
            cart = new Cart({
                userId,
                items: [{ productId, size, quantity: Math.max(1, Number(quantity)) }]
            });
        } else {
            // Check if this product with the same size is already in the cart
            const item = cart.items.find(
                (item) => item.productId?.toString() === productId.toString() && (item.size || "500g") === size
            );

            if (item) {
                item.quantity += Math.max(1, Number(quantity));
            } else {
                cart.items.push({ productId, size, quantity: Math.max(1, Number(quantity)) });
            }
        }

        await cart.save();
        res.json({ message: "Item added to cart", success: true, error: false, cart });
    } catch (error) {
        console.error("Add to cart error:", error);
        res.status(500).json({ message: "Server error", success: false, error: true });
    }
};

// Remove item from cart
const removeItem = async (req, res) => {
    try {
        const userId = req.userId || req.user?.id || req.user?._id;
        const { productId, size } = req.body;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized", success: false, error: true });
        }

        if (!productId) {
            return res.status(400).json({ message: "Product ID is required", success: false, error: true });
        }

        let cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found", success: false, error: true });
        }

        cart.items = cart.items.filter((item) => {
            if (size) {
                return !(item.productId?.toString() === productId.toString() && (item.size || "500g") === size);
            }
            return item.productId?.toString() !== productId.toString();
        });

        await cart.save();
        res.json({ message: "Item removed from cart", success: true, error: false, cart });
    } catch (err) {
        console.error("Remove from cart error:", err);
        return res.status(500).json({ message: "Server Error", success: false, error: true, err });
    }
};

// Update item quantity in cart
const updateQuantity = async (req, res) => {
    try {
        const userId = req.userId || req.user?.id || req.user?._id;
        const { productId, size, quantity } = req.body;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized", success: false, error: true });
        }

        if (!productId || quantity === undefined) {
            return res.status(400).json({ message: "Product ID and quantity are required", success: false, error: true });
        }

        let cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found", success: false, error: true });
        }

        if (Number(quantity) <= 0) {
            cart.items = cart.items.filter((item) => {
                if (size) {
                    return !(item.productId?.toString() === productId.toString() && (item.size || "500g") === size);
                }
                return item.productId?.toString() !== productId.toString();
            });
        } else {
            const item = cart.items.find((item) => {
                if (size) {
                    return item.productId?.toString() === productId.toString() && (item.size || "500g") === size;
                }
                return item.productId?.toString() === productId.toString();
            });

            if (!item) {
                return res.status(404).json({ message: "Item not found in cart", success: false, error: true });
            }

            item.quantity = Number(quantity);
        }

        await cart.save();
        res.json({ message: "Quantity updated successfully", success: true, error: false, cart });
    } catch (err) {
        console.error("Update quantity error:", err);
        return res.status(500).json({ message: "Server error", success: false, error: true, err });
    }
};

// Get authenticated user's cart
const getMyCart = async (req, res) => {
    try {
        const userId = req.userId || req.user?.id || req.user?._id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized", success: false, error: true });
        }

        let cart = await Cart.findOne({ userId }).populate("items.productId");
        if (!cart) {
            cart = { userId, items: [] };
        }
        res.json({ message: "Cart retrieved successfully", success: true, error: false, cart });
    } catch (err) {
        return res.status(500).json({ message: "Server error", success: false, error: true, err });
    }
};

// Clear entire cart
const clearCart = async (req, res) => {
    try {
        const userId = req.userId || req.user?.id || req.user?._id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized", success: false, error: true });
        }

        await Cart.findOneAndUpdate({ userId }, { $set: { items: [] } });
        res.json({ message: "Cart cleared successfully", success: true, error: false });
    } catch (err) {
        return res.status(500).json({ message: "Server error", success: false, error: true, err });
    }
};

// get cart by user Id (legacy route)
const getCartByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const cart = await Cart.findOne({ userId }).populate("items.productId");
        if (!cart) {
            return res.status(404).json({ message: "Cart not found", success: false, error: true });
        }
        res.json({ message: "Cart retrieved successfully", success: true, error: false, cart });
    } catch (err) {
        return res.status(500).json({ message: "Server error", success: false, error: true, err });
    }
};

export { addTocart, removeItem, updateQuantity, getCartByUserId, getMyCart, clearCart };