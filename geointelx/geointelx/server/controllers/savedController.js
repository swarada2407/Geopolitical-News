import SavedNews from "../models/SavedNews.js";

export async function saveNews(req, res) {
  try {
    const {
      title,
      description,
      url,
      urlToImage,
      source,
      publishedAt,
    } = req.body;

    const userId = req.user._id;

    const exists = await SavedNews.findOne({ userId, url });

    if (exists) {
      return res.status(400).json({ message: "Already saved" });
    }

    const saved = await SavedNews.create({
      userId,
      title,
      description,
      url,
      urlToImage,
      source,
      publishedAt,
    });

    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: "Failed to save article" });
  }
}

export async function getSavedNews(req, res) {
  try {
    const userId = req.user._id;

    const saved = await SavedNews.find({ userId }).sort({ createdAt: -1 });

    res.json(saved);
  } catch (error) {
    res.status(500).json({ message: "Failed to get saved news" });
  }
}

export async function removeSavedNews(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const savedItem = await SavedNews.findOne({ _id: id, userId });

    if (!savedItem) {
      return res.status(404).json({ message: "Article not found or unauthorized" });
    }

    await SavedNews.findByIdAndDelete(id);

    res.json({ message: "Removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove saved news" });
  }
}