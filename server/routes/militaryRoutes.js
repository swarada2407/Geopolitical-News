import express from "express";
import {
  getAllMilitaryCountries,
  getMilitaryCountry,
  addMilitaryCountry,
  updateMilitaryCountry,
  deleteMilitaryCountry,
} from "../controllers/militaryController.js";
import { protect, adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get("/", getAllMilitaryCountries);
router.get("/:name", getMilitaryCountry);

// Admin only routes
router.post("/", protect, adminOnly, addMilitaryCountry);
router.put("/:id", protect, adminOnly, updateMilitaryCountry);
router.delete("/:id", protect, adminOnly, deleteMilitaryCountry);

export default router;