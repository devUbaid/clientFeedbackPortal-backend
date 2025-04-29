// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Configs & DB
import connectDB from "./db/db.js";

// Routes & Middleware
import authRoutes from "./routes/auth.js";
import feedbackRoutes from "./routes/feedback.js";
import errorHandler from "./middleware/errorHandler.js";

// Load env vars
dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS setup
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

// Middleware
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/feedback", feedbackRoutes);

// Error handler
app.use(errorHandler);

// Test route
app.get("/", (req, res) => {
  res.send("Client Feedback Portal API is running");
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
