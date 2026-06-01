import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || "",
});

export async function generateAIResponse(prompt: string) {
  if (!prompt) return "";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
    });

    return response.text || "";
  } catch (error) {
    console.error("AI Error:", error);
    return "AI request failed";
  }
}
