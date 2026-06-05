// Phase 18 - Workspace UI Layer
// Full frontend application shell for WordCom AI OS
// Connects Editor, AI Panel, and SystemKernel runtime

import React, { useState } from "react";
import { useKernel } from "../kernel-provider";

export function WorkspaceApp() {
  const { kernel, ready, status } = useKernel();
  const [activeTab, setActiveTab] = useState<"editor" | "ai" | "activity">("editor");

  if (!ready) {
    return (
      <div style={{ padding: 20 }}>
        <h2>WordCom Loading...</h2>
        <p>Status: {status}</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "sans-serif" }}>
      <div style={{ width: 240, borderRight: "1px solid #ddd", padding: 10 }}>
        <h3>WordCom</h3>
        <button onClick={() => setActiveTab("editor")}>Editor</button>
        <button onClick={() => setActiveTab("ai")}>AI Panel</button>
        <button onClick={() => setActiveTab("activity")}>Activity</button>

        <hr />

        <p style={{ fontSize: 12 }}>Kernel Status:</p>
        <p style={{ fontSize: 12 }}>{status}</p>

        <p style={{ fontSize: 12 }}>
          AI: {kernel ? "Active" : "Offline"}
        </p>
      </div>

      <div style={{ flex: 1, padding: 20 }}>
        {activeTab === "editor" && (
          <div>
            <h2>Editor</h2>
            <textarea style={{ width: "100%", height: "70vh" }} placeholder="Start writing..." />
          </div>
        )}

        {activeTab === "ai" && (
          <div>
            <h2>AI Panel</h2>
            <p>AI integration connected to SystemKernel.</p>
          </div>
        )}

        {activeTab === "activity" && (
          <div>
            <h2>Activity Stream</h2>
            <p>Event log coming from EventSystem.</p>
          </div>
        )}
      </div>
    </div>
  );
}
