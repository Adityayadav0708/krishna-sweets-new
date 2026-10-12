import express from "express"
import{setAddress,getAddressByUserId} from "../controllers/addressController.js"
const router=express.Router();

router.post("/set",setAddress);
router.get("/:userId",getAddressByUserId);

export default router