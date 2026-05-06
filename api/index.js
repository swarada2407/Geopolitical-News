import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Routes and DB
import connectDB from "../server/config/db.js";
import authRoutes from "../server/routes/authRoutes.js";
import newsRoutes from "../server/routes/newsRoutes.js";
import savedRoutes from "../server/routes/savedRoutes.js";
import militaryRoutes from "../server/routes/militaryRoutes.js";
import chatRoutes from "../server/routes/chatRoutes.js";
import quizRoutes from "../server/routes/quizRoutes.js";
import { notFound, errorHandler } from "../server/middleware/errorMiddleware.js";

// Load environment variables based on environment
if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: path.resolve(dirname(fileURLToPath(import.meta.url)), "../server/.env") });
}

const app = express();
app.use(cors({
  origin: "*", // Allow all origins for debugging
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// Database connection state
let isConnected = false;

const connectOnce = async () => {
  if (isConnected) return;
  try {
    console.log("Connecting to database in Serverless function...");
    await connectDB();
    isConnected = true;
    console.log("Database connected successfully in Serverless function.");
  } catch (err) {
    console.error("Database connection error in Serverless function:", err.message);
    throw err;
  }
};

// Health check
app.get("/api/health", async (req, res) => {
  try {
    await connectOnce();
    res.json({
      status: "ok",
      dbConnected: isConnected,
      hasNewsKey: !!process.env.NEWS_API_KEY,
      hasMongoUri: !!process.env.MONGO_URI,
      env: process.env.NODE_ENV,
      time: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Database connection failed",
      error: err.message
    });
  }
});

// Generic middleware for DB connection
const dbMiddleware = async (req, res, next) => {
  try {
    await connectOnce();
    next();
  } catch (error) {
    next(error);
  }
};

// Routes
app.use("/api/auth", dbMiddleware, authRoutes);
app.use("/api/news", newsRoutes); // News doesn't strictly need DB, but let's see
app.use("/api/saved", dbMiddleware, savedRoutes);
app.use("/api/military", dbMiddleware, militaryRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/quiz", dbMiddleware, quizRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

export default app;
