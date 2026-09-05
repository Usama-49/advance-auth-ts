import cookieParser from "cookie-parser";
import express from "express";
import {router as authRouter} from "./routes/auth.routes.js";


export const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth",authRouter);
