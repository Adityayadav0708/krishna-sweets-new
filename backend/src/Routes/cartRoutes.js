import express from 'express';
const router = express.Router();
import { addTocart, removeItem, updateQuantity, getCartByUserId } from "../controllers/CartController.js";
import { auth } from "../Middleware/authMiddleware.js";

// Protected user routes (userId derived from auth token)
router.post("/add", auth, addTocart);
router.post("/remove", auth, removeItem);
router.post("/update", auth, updateQuantity);

// Cart retrieval by userId
router.get("/:userId", getCartByUserId);

export default router;