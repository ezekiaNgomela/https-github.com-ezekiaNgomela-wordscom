import express from "express";
import cors from "cors";
import { db } from "./db";
import { getDocument, saveDocument } from "./documentApi";

const app = express();

app.use(cors());
app.use(express.json());

/**
 * Health check
 */
app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

/**
 * Get document
 */
app.get("/api/documents/:id", async (req, res) => {
  try {
    const doc = await db.document.findUnique({
      where: { id: req.params.id },
    });

    if (!doc) return res.status(404).json({ error: "Not found" });

    res.json(doc);
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * Save document
 */
app.post("/api/documents/:id", async (req, res) => {
  try {
    const { content } = req.body;

    const doc = await db.document.upsert({
      where: { id: req.params.id },
      update: { content },
      create: {
        id: req.params.id,
        content,
      },
    });

    res.json(doc);
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(4000, () => {
  console.log("Backend running on http://localhost:4000");
});
