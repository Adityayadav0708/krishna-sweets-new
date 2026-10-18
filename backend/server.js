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

// ── CHANGED FOR RENDER+VERCEL DEPLOYMENT ──────────────────────────────────────
// isProduction flag: true when NODE_ENV=production (set in Render env vars)
// used below to switch CORS behaviour and morgan log format
const isProduction = process.env.NODE_ENV === "production";
// ──────────────────────────────────────────────────────────────────────────────

// ── CHANGED FOR RENDER+VERCEL DEPLOYMENT ──────────────────────────────────────
// Previously: only process.env.FRONTEND_URL was in the list (which was undefined
// on Render because .env is never uploaded to Render).
// Now: Vercel URL is hardcoded so CORS always works even if FRONTEND_URL is
// missing from Render's environment variables.
// Allowed origins: Vercel frontend (production) + local dev servers
const allowedOrigins = [
  "https://krishna-sweets-new.vercel.app",   // ← ADDED: Vercel production frontend (hardcoded so it always works on Render)
  process.env.FRONTEND_URL,                   // any extra URL set in Render env vars (e.g. a staging URL)
  "http://localhost:5173",                    // local Vite dev server (default port)
  "http://localhost:5174",                    // local Vite dev server (alternate port)
  "http://localhost:5175",                    // local Vite dev server (alternate port)
  "http://localhost:3000",                    // local Create React App / Next.js dev server
].filter(Boolean);                            // removes undefined/null if FRONTEND_URL is not set
// ──────────────────────────────────────────────────────────────────────────────

// ── CHANGED FOR RENDER+VERCEL DEPLOYMENT ──────────────────────────────────────
// Previously: the else branch also called callback(null, true) — meaning ALL
// origins were allowed (no CORS protection at all).
// Now:
//   1. Requests with no origin (Postman, Render health checks) → always allowed
//   2. All localhost origins allowed in development (isProduction = false)
//   3. Known origins (Vercel + localhost list) → allowed
//   4. Everything else in production → BLOCKED with a CORS error
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, server-to-server calls, Render health checks)
    if (!origin) return callback(null, true);

    // Allow all localhost in development so you can test freely on your machine
    if (!isProduction && (origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:"))) {
      return callback(null, true);
    }

    // Allow known/whitelisted origins (Vercel URL + anything in allowedOrigins list)
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Block unknown origins in production (security: stops other websites calling your API)
    return callback(new Error(`CORS blocked: ${origin}`), false);
  },
  credentials: true,  // required for cookies (refreshToken httpOnly cookie) to be sent across origins
}));
// ──────────────────────────────────────────────────────────────────────────────

app.use(express.json())

// help server read cookies from incoming requests (used for refreshToken)
app.use(cookieParser());

// Helmet adds security headers to your Express server.
// help server hide sensitive info
// It helps protect your application from some common web security problems
// "Use Helmet for security, but don't enable its Cross-Origin Resource Policy restriction."
// crossOriginResourcePolicy: false → so Cloudinary image URLs can be loaded by the frontend
app.use(helmet({ crossOriginResourcePolicy: false }));

// ── CHANGED FOR RENDER+VERCEL DEPLOYMENT ──────────────────────────────────────
// Previously: always used "dev" log format (colourful short logs, good for local)
// Now: uses "combined" in production (Apache-style full logs, better for Render's log viewer)
//      uses "dev" locally (short, colourful, easier to read during development)
app.use(morgan(isProduction ? "combined" : "dev"));
// ──────────────────────────────────────────────────────────────────────────────

// ── ADDED FOR RENDER+VERCEL DEPLOYMENT ────────────────────────────────────────
// Health check endpoint — Render pings GET /health to verify the server started
// successfully and is still running. Without this, Render marks the deploy as failed.
// You can also test it yourself: https://krishna-sweets-new-1.onrender.com/health
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", env: process.env.NODE_ENV || "development" });
});
// ──────────────────────────────────────────────────────────────────────────────

// auth routes (login, register, verify email, refresh token, logout)
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

// ── CHANGED FOR RENDER+VERCEL DEPLOYMENT ──────────────────────────────────────
// Previously: res.send("Hello World!") — plain text, not useful in production
// Now: returns JSON with a status message so you can verify the API is live
// by visiting https://krishna-sweets-new-1.onrender.com/ in a browser
app.get("/", (req, res) => {
  res.json({
    message: "Krishna Sweets API is running 🟢",
    env: process.env.NODE_ENV || "development",
  });
});
// ──────────────────────────────────────────────────────────────────────────────

// Render automatically sets the PORT environment variable.
// Locally it falls back to 5006 (matches your .env file).
const PORT = process.env.PORT || 5006;

const startServer = async () => {
  await connectDB();
  // ── CHANGED FOR RENDER+VERCEL DEPLOYMENT ──────────────────────────────────
  // Previously: just logged "Server is running on http://localhost:PORT"
  // Now: logs a clear box with port, environment, and health check URL
  // so you can quickly see these details in Render's log viewer
  app.listen(PORT, () => {
    console.log(`
====================================
🚀 Krishna Sweets API running
   Port     : ${PORT}
   Env      : ${process.env.NODE_ENV || "development"}
   Health   : http://localhost:${PORT}/health
====================================`);
  });
  // ──────────────────────────────────────────────────────────────────────────
};

startServer();
