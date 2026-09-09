import { Request, Response } from "express";
import { loginSchema, registerSchema } from "./auth.schema.js";
import { userModel } from "../../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendRegisterEmail, sendResetPasswordEmail } from "../../services/email.service.js";
import { getAccessToken, getRefreshToken } from "../../utils/auth.utils.js";
import crypto from "node:crypto";
import { getAppUrl } from "../../config/getAppUrl.js";

//! Methods

//! Controllers
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
    //* Tokens

    const accessToken = getAccessToken({
      id: user._id,
      role: user.role,
      tokenVersion: user.tokenVersion,
    });
    const refreshToken = getRefreshToken({ id: user._id, tokenVersion: user.tokenVersion });
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
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.refreshToken as string | undefined;
    if (!token) {
      return res.status(401).json({
        message: "Refresh Token missing",
      });
    }
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as jwt.JwtPayload;
    if (!payload || !payload.id) {
      return res.status(401).json({
        message: "Invalid token payload",
      });
    }
    const user = await userModel.findById(payload.id);
    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }
    if (user.tokenVersion !== payload.tokenVersion) {
      return res.status(401).json({
        message: "Refresh Token invalidated",
      });
    }

    const newAccessToken = getAccessToken({
      id: user._id,
      role: user.role,
      tokenVersion: user.tokenVersion,
    });
    const newRefreshToken = getRefreshToken({ id: user._id, tokenVersion: user.tokenVersion });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({
      message: "Token Refreshed",
      accessToken: newAccessToken,
      user: {
        name: user.name,
        email: user.email,
        verified: user.isUserVerified,
        twoFactorEnabled: user.twoFactorEnabled,
      },
    });
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError || err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        message: "Invalid or expired refresh token",
      });
    }
    console.log(err);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
export const logOut = async (req: Request, res: Response) => {
  try {
    res.clearCookie("refreshToken", {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    return res.status(200).json({
      message: "User Logged Out!",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Internal server Error",
    });
  }
};
export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body as { email?: string };
  if (!email) {
    return res.status(400).json({
      message: "Email is required!",
    });
  }
  const normalizedEmail = email.toLowerCase().trim();
  try {
    const user = await userModel.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(200).json({
        message: "If a user with this email exists, we'll send u an email",
      });
    }
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    user.resetPasswordToken = tokenHash;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();
    const resetUrl = `${getAppUrl()}/auth/reset-password?token=${rawToken}`;
    await sendResetPasswordEmail(user.email, resetUrl);
    return res.status(200).json({
      message: "If a user with this email exists, we'll send u an email",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Internal server Error",
    });
  }
};
export const resetPassword = async (req: Request, res: Response) => {
  const { token, password } = req.body as { token?: string; password?: string };
  if (!token) {
    return res.status(400).json({
      message: "Reset Token is missing!",
    });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({
      message: "Password must be minimum 6 character long!",
    });
  }
  try {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await userModel.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { $gt: new Date() },
    });
    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired token! Plz retry",
      });
    }
    const newPassword = await bcrypt.hash(password, 10);
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.tokenVersion = user.tokenVersion + 1;
    await user.save();
    return res.status(200).json({
      message: "Password Changed Successfully!",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Internal server Error",
    });
  }
};
