import mongoose from "mongoose";
import dns from "node:dns";

// Fix for Windows & ISP DNS issues resolving MongoDB Atlas SRV records
try {
    dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch (e) { }

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            throw new Error("MONGO_URI is missing! Add it in Render's Environment tab.");
        }

        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 10000, //10 sec baad bta dega error agr db se connect na hu 
            // close idle connections after 45s
        });

        console.log(`MongoDB Atlas connected to database [${mongoose.connection.name}] ✅`);
    } catch (error) {
        console.error("MongoDB Connection Error:", error.message);
        process.exit(1);
    }
};

export default connectDB;
