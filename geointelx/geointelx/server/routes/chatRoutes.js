import express from "express";
import { askGemini } from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", askGemini);

export default router;