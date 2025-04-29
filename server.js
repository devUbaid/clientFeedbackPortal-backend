// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Config & DB
import connectDB from "./db/db.js";

// Routes & Middleware
import authRoutes from "./routes/auth.js";
import feedbackRoutes from "./routes/feedback.js";
import errorHandler from "./middleware/errorHandler.js";

// Initialize environment
dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Path setup for ES Modules (__dirname replacement)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ CORS setup: Allow local dev + production frontend
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:3000',
    'https://client-feedbacak-portal.vercel.app' // production frontend
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Serve static files

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/feedback", feedbackRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Default root route
app.get("/", (req, res) => {
  res.send("🚀 Client Feedback Portal API is running");
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
