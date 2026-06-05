// Phase 20.2 - AI Prompt Execution UI
// Connects frontend workspace to SystemKernel AI runtime
// Provides prompt input, execution, and response stream UI

import React, { useState } from "react";
import { useKernel } from "../kernel-provider";

export function AIPanel() {
  const { kernel, ready } = useKernel();

  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string>("");

  async function runPrompt() {
    if (!kernel || !prompt.trim()) return;

    setLoading(true);
    setResponse("");

    try {
      const result = await (kernel as any)?.ai?.run?.(prompt);

      if (typeof result === "string") {
        setResponse(result);
      } else if (result?.text) {
        setResponse(result.text);
      } else {
        setResponse(JSON.stringify(result ?? {}, null, 2));
      }
    } catch (err: any) {
      setResponse("Error executing AI request: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!ready) {
    return <div>Kernel not ready...</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <h2>AI Execution Panel</h2>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Ask the AI..."
        style={{ width: "100%", height: 120, marginBottom: 10 }}
      />

      <button onClick={runPrompt} disabled={loading}>
        {loading ? "Running..." : "Run AI"}
      </button>

      <div style={{ marginTop: 20, padding: 10, border: "1px solid #ddd", minHeight: 200, whiteSpace: "pre-wrap" }}>
        {response || "AI response will appear here..."}
      </div>
    </div>
  );
}
