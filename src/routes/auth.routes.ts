import { Router } from "express";
import { loginUser, registerUser, verifyUserEmail } from "../controllers/auth/auth.controller.js";

export const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/verify-email", verifyUserEmail);
