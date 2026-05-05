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

// Load environment variables from the same directory as server.js
dotenv.config({ path: join(__dirname, '.env') });
console.log("Environment variables loaded.");

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/saved", savedRoutes);
app.use("/api/military", militaryRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/quiz", quizRoutes);

app.use(notFound);
app.use(errorHandler);

app.get("/", (req, res) => {
  res.send("GeoIntelX backend is running");
});

// Export the app for Vercel
export default app;

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}