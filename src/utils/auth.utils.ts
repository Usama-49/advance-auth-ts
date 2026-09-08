import { Types } from "mongoose";
import jwt from "jsonwebtoken";

interface TokenPayload {
  id: Types.ObjectId | string;
  role?: string;
  tokenVersion: number;
}

export const getAccessToken = (payload: TokenPayload): string => {
  if (!process.env.JWT_ACCESS_SECRET) {
    throw new Error("JWT_ACCESS_SECRET is missing in environment variables");
  }

  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "30m",
  });
};
export const getRefreshToken = (payload: TokenPayload): string => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error("JWT_REFRESH_SECRET is missing in environment variables");
  }

  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};
