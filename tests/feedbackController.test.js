
beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  

import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { getAIReplySuggestions } from "../controllers/feedbackController.js";
import Feedback from "../models/Feedback.js";
import axios from "axios";

// Mock Express req/res
const mockResponse = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json   = jest.fn(() => res);
  return res;
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("getAIReplySuggestions controller", () => {
  const fakeFeedback = {
    _id: "fb123",
    text: "I love this product!",
    rating: 5,
  };

  test("returns AI suggestions when API succeeds", async () => {
    // Mock Feedback.findById().lean()
    Feedback.findById = jest.fn().mockReturnValue({
      lean: () => Promise.resolve(fakeFeedback)
    });

    // Mock axios.post
    axios.post = jest.fn().mockResolvedValueOnce({
      data: {
        generated_text:
          "1. Thank you for giving us a 5-star rating. We’re thrilled!\n" +
          "2. Thank you for giving us a 5-star rating. Your feedback means a lot!"
      }
    });

    const req = { params: { id: "fb123" } };
    const res = mockResponse();

    await getAIReplySuggestions(req, res, jest.fn());

    expect(Feedback.findById).toHaveBeenCalledWith("fb123");
    expect(axios.post).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      suggestions: [
        "Thank you for giving us a 5-star rating. We’re thrilled!",
        "Thank you for giving us a 5-star rating. Your feedback means a lot!"
      ]
    });
  });

  test("falls back when API errors", async () => {
    Feedback.findById = jest.fn().mockReturnValue({
      lean: () => Promise.resolve(fakeFeedback)
    });

    axios.post = jest.fn().mockRejectedValueOnce(new Error("Service down"));

    const req = { params: { id: "fb123" } };
    const res = mockResponse();

    await getAIReplySuggestions(req, res, jest.fn());

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      suggestions: [
        "Thank you for giving us a 5-star rating. We appreciate your feedback.",
        "Thank you for giving us a 5-star rating. We’ll use this to improve."
      ],
      isFallback: true
    });
  });

  test("returns 404 when feedback not found", async () => {
    Feedback.findById = jest.fn().mockReturnValue({
      lean: () => Promise.resolve(null)
    });

    const req = { params: { id: "missing" } };
    const res = mockResponse();

    await getAIReplySuggestions(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Feedback not found"
    });
  });
});
