import express from "express";
import { signup, LoginUser,verifyEmail,logout,uploadAvatar,updateUserDetails, forgotPassword, verifyForgotPasswordOtp, resetPassword,refreshToken,userDetails } from "../controllers/userController.js";
import {auth} from "../Middleware/authMiddleware.js";
import upload from "../Middleware/multer.js";

const router = express.Router();

router.get("/verify-email",verifyEmail);
router.post("/signup", signup);
router.post("/login", LoginUser);
router.post("/logout",auth, logout);
router.put("/upload-avatar",auth,upload.single("avatar"),uploadAvatar)//only login user can access this api
router.put("/update-user",auth,updateUserDetails)

router.post("/forgot-password",forgotPassword);
router.post("/verify-forgot-password-otp",verifyForgotPasswordOtp);
router.post("/reset-password",resetPassword);
router.post("/refresh-token",refreshToken)
router.post("/user-details",userDetails);
export default router;