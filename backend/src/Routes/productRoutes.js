import express from "express";
const router=express.Router();


import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

router.post("/add",createProduct);
router.get("/",getAllProducts);
router.get("/:id",getProductById);
// update product use put
router.put("/update/:id",updateProduct);
router.delete("/delete/:id",deleteProduct);
export default router;