import express from "express";

const app = express();
app.use(express.json());

app.post("/ai/run", async (req, res) => {
  const { task, input } = req.body;

  return res.json({
    result: `AI processed task: ${task}`,
    input
  });
});

app.listen(4000, () => {
  console.log("AI Orchestrator running on port 4000");
});
