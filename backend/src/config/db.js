import mongoose from "mongoose";
import dns from "node:dns";

// Fix for some environments where ISP DNS can't resolve MongoDB Atlas SRV records
try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch (e) {}

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error("MONGO_URI is missing in environment variables! Add it in Render's Environment tab.");
    }
    await mongoose.connect(uri, {
      dbName: "krishna_sweets",          // always use this database name
      serverSelectionTimeoutMS: 10000,   // fail fast if Atlas is unreachable (10s)
      socketTimeoutMS: 45000,            // close idle sockets after 45s
    });
    console.log(`MongoDB Atlas connected ✅`);
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
