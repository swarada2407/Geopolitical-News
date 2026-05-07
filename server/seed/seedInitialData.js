import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import SavedNews from "../models/SavedNews.js";
import QuizResult from "../models/QuizResult.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

async function seedInitialData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB Atlas...");

    // 1. Seed Admin User
    const adminEmail = "admin@geointelx.com";
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    let adminId;
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("admin123", salt);
      
      const admin = await User.create({
        name: "Admin User",
        email: adminEmail,
        password: hashedPassword,
        role: "admin"
      });
      adminId = admin._id;
      console.log("Admin user created (admin@geointelx.com / admin123)");
    } else {
      adminId = existingAdmin._id;
      console.log("Admin user already exists.");
    }

    // 2. Seed Example User
    const userEmail = "user@example.com";
    const existingUser = await User.findOne({ email: userEmail });
    
    let userId;
    if (!existingUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("user123", salt);
      
      const user = await User.create({
        name: "Example User",
        email: userEmail,
        password: hashedPassword,
        role: "user"
      });
      userId = user._id;
      console.log("Example user created (user@example.com / user123)");
    } else {
      userId = existingUser._id;
      console.log("Example user already exists.");
    }

    // 3. Seed Saved News (Example)
    const existingSaved = await SavedNews.findOne({ userId });
    if (!existingSaved) {
      await SavedNews.create({
        userId,
        title: "Strategic Importance of the Indo-Pacific",
        description: "An analysis of the growing military presence in the Indo-Pacific region and its global implications.",
        url: "https://example.com/indo-pacific-strategic",
        urlToImage: "https://images.unsplash.com/photo-1504711434969-e33886168f5c",
        source: "GeoIntelX Analysis",
        publishedAt: new Date().toISOString()
      });
      console.log("Sample saved news created for example user.");
    }

    // 4. Seed Quiz Results (Example)
    const existingQuiz = await QuizResult.findOne({ topic: "Global Geopolitics" });
    if (!existingQuiz) {
      await QuizResult.create({
        user: userId,
        topic: "Global Geopolitics",
        score: 8,
        totalQuestions: 10,
        percentage: 80
      });
      console.log("Sample quiz result created for example user.");
    }

    console.log("Initial data seeding completed successfully!");
    process.exit();
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
}

seedInitialData();
