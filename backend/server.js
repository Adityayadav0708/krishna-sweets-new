import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./src/config/db.js";
import userRoutes from "./src/Routes/userRoutes.js";
import productRoutes from "./src/Routes/productRoutes.js";
import cartRoutes from "./src/Routes/cartRoutes.js";
import addressRoutes from "./src/Routes/addressRoutes.js";
import orderRoutes from "./src/Routes/Order.js";
import analyticsRoutes from "./src/Routes/analyticsRoutes.js";
import { auth, isAdmin } from "./src/Middleware/authMiddleware.js";
import helmet from "helmet";
import morgan from "morgan";

// Help server read cookies and HTTP requests sent by frontend
// Used for JWT authentication
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

const isProduction = process.env.NODE_ENV === "production";

const allowedOrigins = [
    // "https://krishna-sweets-new.vercel.app",
    process.env.FRONTEND_URL,
    "http://localhost:5173",
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (Postman and server-to-server calls)
        if (!origin) return callback(null, true);

        // Allow localhost origins in development
        if (
            !isProduction &&
            (origin.startsWith("http://localhost:") ||
             origin.startsWith("http://127.0.0.1:"))
        ) {
            return callback(null, true);
        }

        // Allow known origins
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        // Block unknown origins
        return callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
}));

app.use(express.json());

// Help server read cookies from incoming requests
// Used for refreshToken
app.use(cookieParser());

// Helmet adds security headers to your Express server.
// Helps protect your application from common web security problems.
// crossOriginResourcePolicy: false allows cross-origin resources when needed.
app.use(helmet({
    crossOriginResourcePolicy: false,
}));

app.use(morgan(isProduction ? "combined" : "dev"));

// Health check endpoint for Render
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        env: process.env.NODE_ENV || "development",
    });
});

// Auth routes (login, register, verify email, refresh token, logout)
app.use("/api/auth", userRoutes);

// Product routes
app.use("/api/products", productRoutes);

// Cart routes
app.use("/api/cart", cartRoutes);

// Address routes
app.use("/api/address", addressRoutes);

// Order routes
app.use("/api/orders", orderRoutes);

// Admin analytics routes
app.use("/api/admin/analytics", auth, isAdmin, analyticsRoutes);

// API status endpoint
app.get("/", (req, res) => {
    res.json({
        message: "Krishna Sweets API is running 🟢",
        env: process.env.NODE_ENV || "development",
    });
});

// Render automatically sets the PORT environment variable.
// Locally, it falls back to port 5006.
const PORT = process.env.PORT || 5006;

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`
====================================
Krishna Sweets API running
Port   : ${PORT}
Env    : ${process.env.NODE_ENV || "development"}
Health : http://localhost:${PORT}/health
====================================`);
    });
};

startServer();