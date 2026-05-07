import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import newsRoutes from "./routes/newsRoutes.js";
import savedRoutes from "./routes/savedRoutes.js";
import militaryRoutes from "./routes/militaryRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

console.log("Environment variables loaded:");
console.log("- PORT:", process.env.PORT);
console.log("- MONGO_URI:", process.env.MONGO_URI ? "Present" : "Missing");
console.log("- GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? "Present" : "Missing");
console.log("- NEWS_API_KEY:", process.env.NEWS_API_KEY ? "Present" : "Missing");

// Connect to Database
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

const app = express();

app.use(cors({
  origin: "*", // Allow all origins for debugging
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// Non-blocking DB connection middleware
app.use((req, res, next) => {
  connectOnce().catch(err => {
    dbError = err.message;
  });
  next();
});

// Health check and root routes
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    dbConnected: isConnected,
    dbError: dbError,
    hasNewsKey: !!process.env.NEWS_API_KEY,
    hasMongoUri: !!process.env.MONGO_URI,
    hasGoogleId: !!process.env.GOOGLE_CLIENT_ID,
    env: process.env.NODE_ENV,
    time: new Date().toISOString()
  });
});

app.get("/", (req, res) => {
  res.send("GeoIntelX backend is running");
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/saved", savedRoutes);
app.use("/api/military", militaryRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/quiz", quizRoutes);

// Error Handling (Must be after routes)
app.use(notFound);
app.use(errorHandler);

// Export the app for Vercel
export { app };
export default app;

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
