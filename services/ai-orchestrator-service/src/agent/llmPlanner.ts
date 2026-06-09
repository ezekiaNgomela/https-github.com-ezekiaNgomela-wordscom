import fetch from "node-fetch";
import { buildPlannerPrompt } from "./promptBuilder";
import { parsePlan } from "./planParser";
import { Plan } from "./runtime";

export async function createLLMPlan(input: string): Promise<Plan> {
  const prompt = buildPlannerPrompt(input);

  // uses existing AI service as pseudo-LLM endpoint
  const res = await fetch("http://ai-service:4000/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt })
  });

  const data = await res.json();
  const raw = data?.text || data?.output || "";

  return parsePlan(raw);
}
