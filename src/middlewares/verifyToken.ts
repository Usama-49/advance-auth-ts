import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { userModel } from "../models/user.model.js";

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const headerToken = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
  const token = headerToken;
  if (!token) {
    return res.status(401).json({
      message: "Unauthorized; Token is missing",
    });
  }
  try {
    if (!process.env.JWT_ACCESS_SECRET) {
      return res.status(500).json({
        message: "Server misconfiguration: Secret missing!",
      });
    }
    const verify = jwt.verify(token, process.env.JWT_ACCESS_SECRET) as jwt.JwtPayload;
    if (!verify) {
      return res.status(401).json({
        message: "Invalid token!",
      });
    }
    const user = await userModel.findById(verify.id);
    if (!user) {
      return res.status(401).json({
        message: "User not Found!",
      });
    }
    if (user.tokenVersion !== verify.tokenVersion) {
      return res.status(401).json({
        message: "Token Invalidated!",
      });
    }
    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      isEmailVerified: user.isUserVerified,
      role: user.role,
    };
    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError || err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        message: "Invalid or expired access token!",
      });
    }
    console.log(err);
    return res.status(500).json({
      message: "Internal server Error!",
    });
  }
};
