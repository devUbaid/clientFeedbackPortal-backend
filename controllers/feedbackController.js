import Feedback from "../models/Feedback.js";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const HF_MODEL = "microsoft/DialoGPT-medium";

export const createFeedback = async (req, res, next) => {
  try {
    const { text, rating } = req.body;

    // Create feedback object
    const feedbackData = {
      user: req.user._id,
      text,
      rating: Number.parseInt(rating),
    };

    // Add image URL if file was uploaded
    if (req.file) {
      feedbackData.imageUrl = `/uploads/${req.file.filename}`;
    }

    // Create feedback
    const feedback = await Feedback.create(feedbackData);

    // Populate user data
    const populatedFeedback = await Feedback.findById(feedback._id).populate(
      "user",
      "name email"
    );

    res.status(201).json({
      success: true,
      feedback: populatedFeedback,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllFeedbacks = async (req, res, next) => {
  try {
    // Extract query parameters
    const { rating, sortBy } = req.query;

    // Build query
    const query = {};

    // Filter by rating if provided
    if (rating) {
      query.rating = Number.parseInt(rating);
    }

    // Determine sort order
    let sort = {};
    if (sortBy === "oldest") {
      sort = { createdAt: 1 };
    } else {
      // Default to newest first
      sort = { createdAt: -1 };
    }

    // Execute query with population
    const feedbacks = await Feedback.find(query)
      .populate("user", "name email")
      .populate("replies.admin", "name")
      .sort(sort);

    // Convert ObjectIds to strings for consistent comparison
    const serializedFeedbacks = feedbacks.map((feedback) => {
      const feedbackObj = feedback.toObject();
      feedbackObj._id = feedbackObj._id.toString();
      if (feedbackObj.user && feedbackObj.user._id) {
        feedbackObj.user._id = feedbackObj.user._id.toString();
      }
      return feedbackObj;
    });

    res.status(200).json({
      success: true,
      count: feedbacks.length,
      feedbacks: serializedFeedbacks,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserFeedbacks = async (req, res, next) => {
  try {
    // Extract query parameters
    const { sortBy } = req.query;

    // Build query for current user
    const query = { user: req.user._id };

    // Determine sort order
    let sort = {};
    if (sortBy === "oldest") {
      sort = { createdAt: 1 };
    } else {
      // Default to newest first
      sort = { createdAt: -1 };
    }

    // Execute query with population
    const feedbacks = await Feedback.find(query)
      .populate("user", "name email")
      .populate("replies.admin", "name")
      .sort(sort);

    // Convert ObjectIds to strings for consistent comparison
    const serializedFeedbacks = feedbacks.map((feedback) => {
      const feedbackObj = feedback.toObject();
      feedbackObj._id = feedbackObj._id.toString();
      if (feedbackObj.user && feedbackObj.user._id) {
        feedbackObj.user._id = feedbackObj.user._id.toString();
      }
      return feedbackObj;
    });

    res.status(200).json({
      success: true,
      count: feedbacks.length,
      feedbacks: serializedFeedbacks,
    });
  } catch (error) {
    next(error);
  }
};

export const getFeedbackById = async (req, res, next) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate("user", "name email")
      .populate("replies.admin", "name");

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    // Check if the user is the owner or an admin
    if (
      feedback.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this feedback",
      });
    }

    res.status(200).json({
      success: true,
      feedback,
    });
  } catch (error) {
    next(error);
  }
};

export const addReplyToFeedback = async (req, res, next) => {
  try {
    const { text } = req.body;

    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    // Add reply
    feedback.replies.push({
      text,
      admin: req.user._id,
    });

    await feedback.save();

    // Get updated feedback with populated fields
    const updatedFeedback = await Feedback.findById(req.params.id)
      .populate("user", "name email")
      .populate("replies.admin", "name");

    res.status(200).json({
      success: true,
      feedback: updatedFeedback,
    });
  } catch (error) {
    next(error);
  }
};

export const getAIReplySuggestions = async (req, res, next) => {
  let feedback; // declare outer so both try and catch can see it

  try {
    feedback = await Feedback.findById(req.params.id).lean();
    if (!feedback) {
      return res
        .status(404)
        .json({ success: false, message: "Feedback not found" });
    }

    const snippet =
      feedback.text.length > 100
        ? feedback.text.slice(0, 100) + "…"
        : feedback.text;

    const prompt = `
User rated us ${feedback.rating}/5 and said: "${snippet}"
Write **two** professional replies:
1. “Thank you for giving us a ${feedback.rating}-star rating.”
2. Address their comment in one sentence.
3. Under 20 words each.
`;

    // Call HF inference
    const url = `https://api-inference.huggingface.co/models/${HF_MODEL}`;
    const { data } = await axios.post(
      url,
      {
        inputs: prompt,
        parameters: { max_length: 50, truncation: "only_first" },
      },
      {
        headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}` },
        timeout: 5000,
      }
    );

    const raw =
      data.generated_text ||
      (Array.isArray(data) && data[0]?.generated_text) ||
      "";
    const suggestions = raw
      .split(/\n(?=\d\.)/)
      .map((line) => line.replace(/^\d\.\s*/, "").trim())
      .filter(Boolean)
      .slice(0, 2);

    return res.json({ success: true, suggestions });
  } catch (err) {
    console.error("AI Suggestion Error:", err.message);

    // Ensure we still have feedback.rating available
    const rating = feedback?.rating ?? "N/A";

    // Fallback replies
    const fallback = [
      `Thank you for giving us a ${rating}-star rating. We appreciate your feedback.`,
      `Thank you for giving us a ${rating}-star rating. We’ll use this to improve.`,
    ];

    return res.json({
      success: true,
      suggestions: fallback,
      isFallback: true,
    });
  }
};
