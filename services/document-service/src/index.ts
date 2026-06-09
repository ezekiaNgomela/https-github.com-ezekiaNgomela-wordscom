import express from "express";

const app = express();
app.use(express.json());

app.post("/documents", (req, res) => {
  return res.json({
    status: "created",
    document: req.body
  });
});

app.get("/documents/:id", (req, res) => {
  return res.json({
    id: req.params.id,
    content: {}
  });
});

app.listen(4000, () => {
  console.log("Document Service v1 running on port 4000");
});
