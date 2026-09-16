import { Router } from "express";
import {
  forgotPassword,
  googleAuthCallback,
  googleAuthStart,
  loginUser,
  logOut,
  refreshToken,
  registerUser,
  resetPassword,
  verifyUserEmail,
} from "../controllers/auth/auth.controller.js";

export const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logOut);
router.get("/verify-email", verifyUserEmail);
router.post("/refresh", refreshToken);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/google", googleAuthStart);
router.get("/google/callback", googleAuthCallback);
