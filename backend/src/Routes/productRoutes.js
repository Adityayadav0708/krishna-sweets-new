import express from "express";
const router = express.Router();

import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  uploadProductImage,
} from "../controllers/productController.js";
import { auth, isAdmin } from "../Middleware/authMiddleware.js";
import upload from "../Middleware/multer.js";

// Public catalog routes
router.get("/", getAllProducts);
router.get("/:id", getProductById);

// Protected admin routes
router.post("/add", auth, isAdmin, createProduct);
router.put("/update/:id", auth, isAdmin, updateProduct);
router.delete("/delete/:id", auth, isAdmin, deleteProduct);
router.post("/upload-image", auth, isAdmin, upload.single("image"), uploadProductImage);

export default router;