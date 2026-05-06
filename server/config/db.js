import mongoose from "mongoose";

async function connectDB() {
  try {
    const connString = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/geointelx";
    await mongoose.connect(connString, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
}

export default connectDB;