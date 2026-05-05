import express from "express";
import {
  loginUser,
  registerUser,
  googleAuth,
  getAllUsersWithStats,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import { protect, adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleAuth);
router.get("/users", protect, adminOnly, getAllUsersWithStats);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;