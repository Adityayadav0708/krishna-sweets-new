import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./src/config/db.js";
import userRoutes from "./src/Routes/userRoutes.js";
import productRoutes from "./src/Routes/productRoutes.js";
import cartRoutes from "./src/Routes/cartRoutes.js";
import addressRoutes from "./src/Routes/addressRoutes.js";
import orderRoutes from "./src/Routes/Order.js";
import helmet from "helmet";
import morgan from "morgan";



//help server  read cookie and http req send by frontend
// used for jwt authetication
import cookieParser from "cookie-parser";
dotenv.config();

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:3000"
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // In development, allow localhost origins and server-to-server calls
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:")) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true
}));

app.use(express.json())

//help server  read cookie and http req send by frontend
app.use(cookieParser())




//Helmet adds security headers to your Express server.
// help server  hide sensitive inf
//It helps protect your application from some common 
// web security problems
//"Use Helmet for security, but
//  don't enable its Cross-Origin Resource Policy restriction."
app.use(helmet({
    crossOriginResourcePolicy:false
}))

// help server 
app.use(morgan("dev"))
app.use("/api/auth", userRoutes);

// product routes
app.use("/api/products", productRoutes);

// cart routes
app.use("/api/cart", cartRoutes);

// address routes
app.use("/api/address", addressRoutes);

// order routes
app.use("/api/orders", orderRoutes);

app.get("/", (req, res) => {
    res.send("Hello World!");
});

const PORT = process.env.PORT || 5006;

const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
};

startServer();
