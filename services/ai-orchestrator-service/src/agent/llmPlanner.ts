import fetch from "node-fetch";
import { buildPlannerPrompt } from "./promptBuilder";
import { parsePlan } from "./planParser";
import { Plan } from "./runtime";
import { loadMemoryContext } from "../memory/memoryLoader";

export async function createLLMPlan(
  input: string,
  sessionId?: string,
  userId?: string
): Promise<Plan> {
  const memoryContext = sessionId ? loadMemoryContext(sessionId, userId) : undefined;

  const prompt = buildPlannerPrompt(input, memoryContext);

  const res = await fetch("http://ai-service:4000/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt })
  });

  const data = await res.json();
  const raw = data?.text || data?.output || "";

  return parsePlan(raw);
}