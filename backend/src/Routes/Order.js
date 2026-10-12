import express from "express";
import { placeOrder, getMyOrders, getAllOrders, updateOrderStatus } from "../controllers/orderController.js";
import { auth, isAdmin, optionalAuth } from "../Middleware/authMiddleware.js";

const router = express.Router();

// Customer order routes
router.post("/place", optionalAuth, placeOrder);
router.get("/my-orders", auth, getMyOrders);

// Admin order management routes
router.get("/all-orders", auth, isAdmin, getAllOrders);
router.put("/update-status/:id", auth, isAdmin, updateOrderStatus);

export default router;