import express from "express";
import { generateQuiz, saveQuizResult, getQuizStats } from "../controllers/quizController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/generate", generateQuiz);
router.post("/save", saveQuizResult);
router.get("/stats", getQuizStats);

export default router;
