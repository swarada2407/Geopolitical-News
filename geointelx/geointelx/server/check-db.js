import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import SavedNews from "./models/SavedNews.js";

dotenv.config();

const checkDatabase = async () => {
  try {
    const connString = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/geointelx";
    console.log(`Connecting to MongoDB: ${connString}`);
    await mongoose.connect(connString);
    console.log("Connected successfully!\n");

    console.log("--- USERS ---");
    const users = await User.find({}, "name email googleId password role createdAt");
    if (users.length === 0) {
      console.log("No users found.");
    } else {
      users.forEach((user, i) => {
        const authType = user.googleId ? "Google" : "Email/Password";
        const hasPassword = user.password ? "Yes" : "No";
        console.log(`${i + 1}. ${user.name} (${user.email}) - Role: ${user.role || 'user'}, Auth: ${authType}, Has Pwd: ${hasPassword}, Joined: ${user.createdAt}`);
      });
    }

    console.log("\n--- SAVED NEWS ---");
    const news = await SavedNews.find({}).populate("userId", "name email");
    if (news.length === 0) {
      console.log("No saved news found.");
    } else {
      news.forEach((item, i) => {
        const userName = item.userId ? item.userId.name : "Unknown User";
        console.log(`${i + 1}. [${userName}] ${item.title.substring(0, 50)}...`);
        console.log(`   URL: ${item.url}`);
      });
    }

    await mongoose.connection.close();
    console.log("\nDatabase check complete. Connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("Error checking database:", error.message);
    process.exit(1);
  }
};

checkDatabase();
