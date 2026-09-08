import { Router } from "express";
import {
  forgotPassword,
  loginUser,
  refreshToken,
  registerUser,
  verifyUserEmail,
} from "../controllers/auth/auth.controller.js";

export const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.patch("/verify-email", verifyUserEmail);
router.post("/refresh", refreshToken);
router.post("/forgot-password",forgotPassword);