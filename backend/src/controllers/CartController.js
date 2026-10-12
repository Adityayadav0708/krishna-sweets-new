import Cart from "../models/Cart.js";



// Add items to Cart
const addTocart = async (req, res) => {
    try {
        // Derive userId securely from authenticated user session
        const userId = req.userId || req.user?.id || req.user?._id;
        const { productId } = req.body;

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
                items: [{ productId, quantity: 1 }]
            });
        } else {
            // Check if this product is already in the cart
            const item = cart.items.find((item) => item.productId.toString() === productId);

            if (item) {
                item.quantity += 1;
            } else {
                cart.items.push({ productId, quantity: 1 });
            }
        }

        await cart.save();
        res.json({ message: "Item added to cart", cart });
    } catch (error) {
        console.error("Add to cart error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Remove item from cart
const removeItem = async (req, res) => {
    try {
        const userId = req.userId || req.user?.id || req.user?._id;
        const { productId } = req.body;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized", success: false, error: true });
        }

        if (!productId) {
            return res.status(400).json({ message: "Product ID is required", success: false, error: true });
        }

        let cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        cart.items = cart.items.filter((item) => item.productId.toString() !== productId);

        await cart.save();
        res.json({ message: "Item removed from cart", cart });
    } catch (err) {
        console.error("Remove from cart error:", err);
        return res.status(500).json({ message: "Server Error", err });
    }
};

// Update item quantity in cart
const updateQuantity = async (req, res) => {
    try {
        const userId = req.userId || req.user?.id || req.user?._id;
        const { productId, quantity } = req.body;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized", success: false, error: true });
        }

        if (!productId || quantity === undefined) {
            return res.status(400).json({ message: "Product ID and quantity are required", success: false, error: true });
        }

        let cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        const item = cart.items.find(item => item.productId.toString() === productId);
        if (!item) {
            return res.status(404).json({ message: "Item not found in cart" });
        }

        item.quantity = quantity;

        await cart.save();
        res.json({ message: "Quantity updated successfully", cart });
    } catch (err) {
        console.error("Update quantity error:", err);
        return res.status(500).json({ message: "Server error", err });
    }
};

// get cart by user Id 

//This function is used when the cart page opens.
// It fetches the cart and fills the productId with actual product details (name, price, image).
const getCartByUserId = async (req, res) => {
    try {
        const { userId } = req.params; // fetch useid from url


        // find cart + popolate
        const cart = await Cart.findOne({ userId })


            //"Find this user's cart, and wherever you see items.productId,
            //  replace that ID with the corresponding Product document.



            // productId ke place  pr Product ki bhi details le aenge product model se {ref:Product use kiya issi lie}
            //{
            //  "productId": "P123",    "quantity": 2
            //} after populate will become  
            //     {
            //     "productId": {
            //         "_id": "P123",
            //         "title": "Jalebi",
            //         "price": 250,
            //         "image": "jalebi.jpg",
            //         "stock": 50
            //     },
            //     "quantity": 2
            // }

            //populate() = ID ke through related document ka actual data le aana.
            .populate("items.productId");
        if (!cart) {
            return res.status(404).json({ message: "cart not found" })
        }
        res.json({ message: "cart retreived successfully", cart })
    }
    catch (err) {
        return res.status(500).json({ message: "server error", err })
    }
}

export { addTocart, removeItem, updateQuantity, getCartByUserId }