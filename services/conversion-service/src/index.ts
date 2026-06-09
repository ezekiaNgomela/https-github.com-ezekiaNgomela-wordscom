import express from "express";

const app = express();
app.use(express.json());

app.post("/convert", (req, res) => {
  const { type, documentId } = req.body;

  return res.json({
    status: "processing",
    type,
    documentId
  });
});

app.listen(4000, () => {
  console.log("Conversion Service running on port 4000");
});
