import mongoose from "mongoose";

async function connectDB() {
  try {
    const connString = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/geointelx";
    await mongoose.connect(connString);
    console.log(`MongoDB connected successfully: ${connString}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

export default connectDB;