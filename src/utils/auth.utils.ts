import { Types } from "mongoose";
import jwt from "jsonwebtoken";
import {OAuth2Client} from "google-auth-library";

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
// npm i google-auth-library
export const getGoogleClient = async ()=>{
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if(!clientSecret || !clientId){
    throw new Error("Google Client-id or Client-secret missing!");
  }
  return new OAuth2Client({
    clientId,
    clientSecret,
    redirectUri
  })
}
