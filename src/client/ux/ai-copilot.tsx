// Phase 25.4 - UX Polishing: Floating AI Copilot Overlay
// Inline AI assistant for block-level editing, suggestions, and commands
// Core piece for Notion + Google Docs + AI co-editor experience

import React, { useState } from "react";

export interface AICopilotRequest {
  context: string;
  selection?: string;
  blockId?: string;
  mode: "rewrite" | "expand" | "summarize" | "command";
}

export interface AICopilotResponse {
  result: string;
  suggestions?: string[];
}

export class AICopilotEngine {
  async run(request: AICopilotRequest): Promise<AICopilotResponse> {
    // placeholder: will later connect to AI backend queue system
    const base = request.context;

    switch (request.mode) {
      case "expand":
        return { result: base + "\n\n[AI Expanded Content Placeholder]" };
      case "summarize":
        return { result: "[AI Summary Placeholder]" };
      case "rewrite":
        return { result: "[AI Rewritten Content Placeholder]" };
      case "command":
        return { result: "[AI Command Executed Placeholder]" };
      default:
        return { result: base };
    }
  }
}

export function AICopilotPanel() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const engine = new AICopilotEngine();

  async function handleRun() {
    const res = await engine.run({
      context: input,
      mode: "expand",
    });

    setOutput(res.result);
  }

  return (
    <div style={styles.panel}>
      <div style={styles.header}>AI Copilot</div>

      <textarea
        style={styles.input}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask AI to rewrite, expand, or summarize..."
      />

      <button style={styles.button} onClick={handleRun}>
        Run
      </button>

      <div style={styles.output}>{output}</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    position: "fixed",
    right: 20,
    bottom: 20,
    width: 320,
    height: 400,
    background: "#111",
    color: "#fff",
    padding: 12,
    borderRadius: 12,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    zIndex: 9999,
  },
  header: {
    fontWeight: "bold",
  },
  input: {
    flex: 1,
    background: "#222",
    color: "white",
    border: "none",
    padding: 8,
  },
  button: {
    padding: 8,
    cursor: "pointer",
  },
  output: {
    flex: 1,
    background: "#1a1a1a",
    padding: 8,
    overflowY: "auto",
  },
};
