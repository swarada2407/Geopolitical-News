import express from "express";
import { getTopNews, searchNews, summarizeNews } from "../controllers/newsController.js";

const router = express.Router();

router.get("/top", getTopNews);
router.get("/search", searchNews);
router.post("/summarize", summarizeNews);

export default router;