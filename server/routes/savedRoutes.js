import express from "express";
import {
  saveNews,
  getSavedNews,
  removeSavedNews,
} from "../controllers/savedController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, saveNews);
router.get("/", protect, getSavedNews);
router.delete("/:id", protect, removeSavedNews);

export default router;