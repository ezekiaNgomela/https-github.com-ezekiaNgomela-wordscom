import express from "express";
import { createDocument, getDocument } from "./services/document.client";
import { convertDocument } from "./services/conversion.client";

const app = express();
app.use(express.json());

app.post("/ai/run", async (req, res) => {
  try {
    const { task, input } = req.body;

    const doc = await createDocument({ content: input });

    let out = null;
    if (task === "convert") {
      out = await convertDocument("pdf", doc?.id || "unknown");
    }

    const latest = doc?.id ? await getDocument(doc.id) : null;

    return res.json({
      status: "ok",
      doc,
      latest,
      out
    });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

app.listen(4000, () => {
  console.log("AI service v2 running");
});
