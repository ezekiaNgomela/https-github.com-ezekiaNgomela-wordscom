import express from "express";

/**
 * AI Routes
 * Backend endpoint for AI generation (MVP stub)
 */

export const aiRouter = express.Router();

aiRouter.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    // TODO: integrate real LLM (OpenAI / local model)
    const response = `AI RESPONSE: ${prompt}`;

    res.json({
      result: response,
    });
  } catch (e) {
    res.status(500).json({ error: "AI error" });
  }
});