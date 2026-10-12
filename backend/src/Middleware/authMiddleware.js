import jwt from "jsonwebtoken";
import User from "../models/User.js";

// This auth middleware is basically your security guard for protected routes.
// We check two places to find token:
// 1. cookies: when user logs in and accessToken cookie is set
// 2. headers: Authorization: Bearer <token>
export const auth = (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req?.headers?.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                message: "Unauthorized",
                success: false,
                error: true
            });
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);
        if (!decoded) {
            return res.status(401).json({
                message: "Unauthorized",
                success: false,
                error: true
            });
        }

        req.user = decoded;
        req.userId = decoded?.id || decoded?._id;

        next();
    } catch (error) {
        return res.status(403).json({
            message: "Invalid or expired token.",
            success: false,
            error: true
        });
    }
};

// Admin guard: ensures only users with role === 'admin' can access sensitive routes
export const isAdmin = async (req, res, next) => {
    try {
        if (req.user?.role === "admin") {
            return next();
        }

        const userId = req.userId || req.user?.id || req.user?._id;
        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized",
                success: false,
                error: true
            });
        }

        const user = await User.findById(userId);
        if (!user || user.role !== "admin") {
            return res.status(403).json({
                message: "Admin access required",
                success: false,
                error: true
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Authorization error",
            success: false,
            error: true
        });
    }
};
