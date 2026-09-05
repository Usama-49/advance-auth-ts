import { Request, Response } from "express";
import { loginSchema, registerSchema } from "./auth.schema.js";
import { userModel } from "../../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendRegisterEmail } from "../../services/email.service.js";

const getAppUrl = () => {
  return process.env.APP_URL || `http://localhost:${process.env.PORT}/api`;
};
export const registerUser = async (req: Request, res: Response) => {
  try {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Invalid Data",
        error: result.error.format(),
      });
    }
    const { name, email, password } = result.data;
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await userModel.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        message: "Email already in use with another Account",
      });
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const user = await userModel.create({
      email: normalizedEmail,
      password: hashPassword,
      name,
    });
    //* Email verification via "mailtrap"
    const verifyToken = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_ACCESS_SECRET!,
      {
        expiresIn: "30m",
      },
    );
    const verifyUrl = `${getAppUrl()}/auth/verify-email?token=${verifyToken}`;
    await sendRegisterEmail(user.email, verifyUrl);
    return res.status(201).json({
      message: "User Created",
      newUser: {
        email: user.email,
        name: user.name,
        isUserVerified: user.isUserVerified,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const verifyUserEmail = async (req: Request, res: Response) => {
  const token = req.query.token as string | undefined;
  if (!token) {
    return res.status(400).json({
      message: "Verification Token not Available",
    });
  }
  try {
    if (!process.env.JWT_ACCESS_SECRET) {
      throw new Error("JWT_SECRET is not configured in .env");
    }
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as jwt.JwtPayload;
    const user = await userModel.findOne({ _id: payload.id });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    if (user.isUserVerified) {
      return res.status(200).json({ message: "Email is already verified" });
    }
    user.isUserVerified = true;
    await user.save();
    return res.status(200).json({
      message: "Email verified successfully!",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
export const loginUser = async (req: Request, res: Response) => {
  try {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Invalid Data",
        error: result.error.format(),
      });
    }
    const { email, password } = result.data;
    const normalizedEmail = email.toLowerCase().trim();
    const user = await userModel.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const isPassValid = await bcrypt.compare(password, user.password);
    if (!isPassValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    if (!user.isUserVerified) {
      return res.status(401).json({
        message: "Email not verified!",
      });
    }
    //* Access Token
    const accessToken = jwt.sign(
      { id: user._id, role: user.role, tokenVersion: user.tokenVersion },
      process.env.JWT_ACCESS_SECRET!,
      {
        expiresIn: "30m",
      },
    );
    //* Refresh Token
    const refreshToken = jwt.sign(
      { id: user._id, tokenVersion: user.tokenVersion },
      process.env.JWT_REFRESH_SECRET!,
      {
        expiresIn: "7d",
      },
    );
    //* Cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({
      message: "Successfully Logged In",
      accessToken,
      user: {
        name: user.name,
        email: user.email,
        verified: user.isUserVerified,
        twoFactorEnabled: user.twoFactorEnabled,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
