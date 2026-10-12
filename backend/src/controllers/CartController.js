import Cart from "../models/Cart.js";



// Add items to Cart
const addTocart = async (req, res) => {
    try {
        // when we add item to cart we need two info {UserId , Product Id}
        const { userId, productId } = req.body;
        //check user cart in db with same user id
        let cart = await Cart.findOne({ userId });


        //If this user doesn't already have a cart, create a new one.
        if (!cart) {
            cart = new Cart(
                {
                    userId,

                    // product in cart
                    items:
                        [
                            { productId, quantity: 1 }
                        ]
                })
        }
        else {

            //Check if this product(item) is already in the cart
            //But productId coming from frontend is normally a string:
            const item = cart.items.find((item) => item.productId.toString() === productId);

            // product already exist then increse quantity
            if (item) {
                item.quantity += 1;

            }
            // agr product nhi hai to add new item to cart
            else {
                cart.items.push({ productId, quantity: 1 })
            }
        }
        // save cars chnages to the mongodb . Until this line, you're modifying the Mongoose object in memory.
        await cart.save();
        res.json({ message: "Item added to cart", cart });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
}



//remove item from cart
const removeItem = async (req, res) => {
    try {

        const { userId, productId } = req.body;
        // find user cart
        let cart = await Cart.findOne({ userId });

        // if cart not found
        if (!cart) {
            return res.status(404).json({ message: "cart not found" });
        }

        // remove item from cart

        //.filter() keeps everything that satisfies: **(keep if true)**
        //So it removes the item whose productId matches the one we want to delete.
        cart.items = cart.items.filter((item) => item.productId.toString() !== productId);



        // save changes
        await cart.save();
        res.json({ message: "Item removed from cart", cart });

    }
    catch (err) {
        return res.status(500).json({ message: "Server Error", err })

    }
}

// update item in cart
const updateQuantity = async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: "cart not found" });
        }
        // find item in cart
        const item = cart.items.find(
            item => item.productId.toString() === productId
        )
        // if item not found
        if (!item) {
            return res.status(404).json({ message: "item not found" })
        }
        // update quantity
        item.quantity = quantity;

        // save changes
        await cart.save()
        res.json({ message: "quantity updated successfully", cart });
    }
    catch (err) {
        return res.status(500).json({ message: "server error", err })
    }

}

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