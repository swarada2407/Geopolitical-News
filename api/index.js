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

dotenv.config();

const app = express();
app.use(cors({
  origin: "*", // Allow all origins for debugging
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// Database connection state
let isConnected = false;
let dbError = null;

const connectOnce = async () => {
  if (isConnected) return;
  try {
    await connectDB();
    isConnected = true;
    dbError = null;
  } catch (err) {
    dbError = err.message;
    console.error("Database connection error:", err.message);
  }
};

// Health check
app.get("/api/health", async (req, res) => {
  await connectOnce().catch(() => {});
  res.json({
    status: "ok",
    dbConnected: isConnected,
    dbError: dbError,
    hasNewsKey: !!process.env.NEWS_API_KEY,
    hasMongoUri: !!process.env.MONGO_URI,
    env: process.env.NODE_ENV,
    time: new Date().toISOString()
  });
});

// Routes
app.use("/api/auth", async (req, res, next) => { await connectOnce().catch(() => {}); next(); }, authRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/saved", async (req, res, next) => { await connectOnce().catch(() => {}); next(); }, savedRoutes);
app.use("/api/military", async (req, res, next) => { await connectOnce().catch(() => {}); next(); }, militaryRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/quiz", async (req, res, next) => { await connectOnce().catch(() => {}); next(); }, quizRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

export default app;
