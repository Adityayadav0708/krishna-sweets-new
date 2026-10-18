import mongoose from "mongoose";
import dns from "node:dns";

// Fix for Windows & ISP DNS issues resolving MongoDB Atlas SRV records
// Some ISP DNS servers can't resolve MongoDB Atlas's SRV (_mongodb._tcp) records.
// Switching to Google (8.8.8.8) and Cloudflare (1.1.1.1) DNS servers fixes this.
// The try/catch is there so if this fails in a restricted environment, it won't crash.
try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch (e) {}

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      // ── CHANGED FOR RENDER+VERCEL DEPLOYMENT ────────────────────────────────
      // Previously: error message only said "missing in .env"
      // Now: message tells you exactly WHERE to add it (Render's Environment tab)
      // because .env is never uploaded to Render — you must add vars manually in the dashboard
      throw new Error("MONGO_URI is missing in environment variables! Add it in Render's Environment tab.");
      // ────────────────────────────────────────────────────────────────────────
    }

    // ── CHANGED FOR RENDER+VERCEL DEPLOYMENT ──────────────────────────────────
    // Previously: mongoose.connect(uri) — no options, default timeouts
    // Now: added three options for better reliability on cloud deployments:
    //
    //   dbName: "krishna_sweets"
    //     → Tells Mongoose which database to use inside the Atlas cluster.
    //     → Without this, Mongoose uses whatever name is in the URI string
    //       (or "test" if the URI has no dbName). Hardcoding it avoids confusion.
    //
    //   serverSelectionTimeoutMS: 10000
    //     → How long Mongoose waits to find a working MongoDB server (10 seconds).
    //     → Previously default was 30 seconds — Render would show a blank log
    //       for 30s before showing the error. Now it fails fast in 10s.
    //     → Most common fix for "connect ECONNREFUSED" on Render when
    //       the MONGO_URI env var is missing or Atlas IP whitelist is blocking.
    //
    //   socketTimeoutMS: 45000
    //     → How long an idle socket connection can stay open (45 seconds).
    //     → Prevents "MongoNetworkError: connection timed out" on Render's
    //       free tier which sleeps after inactivity.
    await mongoose.connect(uri, {
      dbName: "krishna_sweets",          // always use this database name inside the Atlas cluster
      serverSelectionTimeoutMS: 10000,   // fail fast (10s) if Atlas is unreachable instead of hanging 30s
      socketTimeoutMS: 45000,            // close idle socket connections after 45 seconds
    });
    // ──────────────────────────────────────────────────────────────────────────

    console.log(`MongoDB Atlas connected ✅`);
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    // Exit the process so Render knows the deploy failed and shows the error in logs
    process.exit(1);
  }
};

export default connectDB;
