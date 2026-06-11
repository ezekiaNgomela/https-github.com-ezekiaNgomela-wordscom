import { useState } from "react";
import { generateAIResponse } from "../backend/aiClient";

/**
 * useAI
 * Frontend hook for AI interactions
 */

export function useAI() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (prompt: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await generateAIResponse(prompt);
      setResult(res.result);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    run,
    result,
    loading,
    error,
  };
}