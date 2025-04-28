import express from "express"
import {
  createFeedback,
  getAllFeedbacks,
  getUserFeedbacks,
  getFeedbackById,
  addReplyToFeedback,
  getAIReplySuggestions,
} from "../controllers/feedbackController.js"
import { protect, admin } from "../middleware/auth.js"
import upload from "../middleware/upload.js"

const router = express.Router()

// Create new feedback with optional image upload
router.post("/", protect, upload.single("image"), createFeedback)

// Get all feedbacks (admin only)
router.get("/", protect, admin, getAllFeedbacks)

// Get current user's feedbacks
router.get("/user", protect, getUserFeedbacks)

// Get feedback by ID
router.get("/:id", protect, getFeedbackById)

// Add admin reply to feedback
router.post("/:id/reply", protect, admin, addReplyToFeedback)

// Get AI reply suggestions
router.get("/:id/suggestions", protect, admin, getAIReplySuggestions)

export default router
