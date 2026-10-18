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

// help server read cookie and http req sent by frontend
// used for jwt authentication
import cookieParser from "cookie-parser";
dotenv.config();

const app = express();

const isProduction = process.env.NODE_ENV === "production";

// Allowed origins: Vercel frontend + local dev
const allowedOrigins = [
  "https://krishna-sweets-new.vercel.app",   // Vercel production frontend
  process.env.FRONTEND_URL,                   // any extra URL set in Render env vars
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:3000",
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, server-to-server, Render health checks)
    if (!origin) return callback(null, true);

    // Allow all localhost in development
    if (!isProduction && (origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:"))) {
      return callback(null, true);
    }

    // Allow known origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Block unknown origins in production
    return callback(new Error(`CORS blocked: ${origin}`), false);
  },
  credentials: true,  // required for cookies (refreshToken) across origins
}));

app.use(express.json())

// help server read cookies from incoming requests (used for refreshToken)
app.use(cookieParser());

// Helmet adds security headers — disable crossOriginResourcePolicy
// so Cloudinary images can be loaded by the frontend
app.use(helmet({ crossOriginResourcePolicy: false }));

// Use combined log format in production, dev format locally
app.use(morgan(isProduction ? "combined" : "dev"));

// Health check endpoint — Render pings this to verify the server is alive
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", env: process.env.NODE_ENV || "development" });
});
app.use("/api/auth", userRoutes);

// product routes
app.use("/api/products", productRoutes);

// cart routes
app.use("/api/cart", cartRoutes);

// address routes
app.use("/api/address", addressRoutes);

// order routes
app.use("/api/orders", orderRoutes);

// admin analytics routes
app.use("/api/admin/analytics", auth, isAdmin, analyticsRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Krishna Sweets API is running 🟢",
    env: process.env.NODE_ENV || "development",
  });
});

const PORT = process.env.PORT || 5006;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`
====================================
🚀 Krishna Sweets API running
   Port     : ${PORT}
   Env      : ${process.env.NODE_ENV || "development"}
   Health   : http://localhost:${PORT}/health
====================================`);
  });
};

startServer();
