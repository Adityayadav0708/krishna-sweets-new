import express from 'express'

const router=express.Router();
import{addTocart,removeItem,updateQuantity,getCartByUserId} from "../controllers/CartController.js"
// import protect from "../Middleware/authMiddleware.js"


// Routes
router.post("/add",addTocart);
// router.delete("/remove",removeItem);
// we are not deleting just removing/updating the item
router.post("/remove",removeItem);
router.post("/update",updateQuantity);
router.get("/:userId",getCartByUserId);


export default router;