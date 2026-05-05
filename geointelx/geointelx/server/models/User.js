import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: function() {
        return !this.googleId; // Password is required only if googleId is not present
      },
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values for traditional users
    },

    avatar: {
      type: String,
    },

    // ✅ ADD THIS
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);