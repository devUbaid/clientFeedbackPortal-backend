import mongoose from "mongoose"

const replySchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
})

const feedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  text: {
    type: String,
    required: [true, "Feedback text is required"],
    trim: true,
  },
  rating: {
    type: Number,
    required: [true, "Rating is required"],
    min: 1,
    max: 5,
  },
  imageUrl: {
    type: String,
    default: null,
  },
  replies: [replySchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const Feedback = mongoose.model("Feedback", feedbackSchema)

export default Feedback
