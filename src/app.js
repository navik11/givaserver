import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv"; // Make sure to import dotenv if you're using environment variables

// Load environment variables from .env file
dotenv.config();

const app = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);

app.use(cookieParser());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

// Import routes here
import userRoutes from "./routes/user.route.js";

// Routes use declaration
app.use("/api/v1/user", userRoutes);

export { app };
