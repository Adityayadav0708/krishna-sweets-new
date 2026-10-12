import express from 'express';
const router = express.Router();
import { addTocart, removeItem, updateQuantity, getCartByUserId, getMyCart, clearCart } from "../controllers/CartController.js";
import { auth } from "../Middleware/authMiddleware.js";

// Protected user routes (userId derived from auth token)
router.get("/my-cart", auth, getMyCart);
router.post("/add", auth, addTocart);
router.post("/remove", auth, removeItem);
router.post("/update", auth, updateQuantity);
router.post("/clear", auth, clearCart);

// Legacy cart retrieval by userId in URL
router.get("/:userId", getCartByUserId);

export default router;