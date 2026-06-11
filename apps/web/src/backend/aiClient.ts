/**
 * AI Client Layer
 * Abstraction for LLM calls (future OpenAI / local model swap)
 */

export async function generateAIResponse(prompt: string) {
  const res = await fetch("/api/ai/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    throw new Error("AI request failed");
  }

  return res.json();
}