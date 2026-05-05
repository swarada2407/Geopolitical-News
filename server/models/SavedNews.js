import mongoose from "mongoose";

const savedNewsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: String,
    description: String,
    url: String,
    urlToImage: String,
    source: String,
    publishedAt: String,
  },
  { timestamps: true }
);

export default mongoose.model("SavedNews", savedNewsSchema);