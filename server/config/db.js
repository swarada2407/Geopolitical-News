import mongoose from "mongoose";

async function connectDB() {
  try {
    const connString = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/geointelx";
    
    // Log the connection attempt (masking password)
    // Handle cases where password might contain special characters like '@'
    let maskedConn = connString;
    try {
      // Check for common connection string issues
      if (connString.includes('@') && connString.split('@').length > 2) {
        console.warn("ADVICE: Your MONGO_URI contains multiple '@' symbols. If connection fails, try replacing '@' in your password with '%40'.");
      }

      const url = new URL(connString);
      if (url.password) {
        url.password = "****";
      }
      maskedConn = url.toString();
    } catch (e) {
      // Fallback to regex if URL parsing fails
      maskedConn = connString.replace(/\/\/.*:.*@/, "//***:***@");
    }
    console.log(`Attempting to connect to MongoDB: ${maskedConn}`);

    await mongoose.connect(connString, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
}

export default connectDB;