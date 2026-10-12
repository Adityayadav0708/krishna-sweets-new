import express from "express";
import { placeOrder } from "../controllers/orderController.js";
import { auth } from "../Middleware/authMiddleware.js";

const router = express.Router();

router.post("/place", auth, placeOrder);

export default router;