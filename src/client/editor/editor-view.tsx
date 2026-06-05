// Phase 22.2 - Unified Editor View (UX + Binding Layer)
// Final composition layer: Toolbar + EditorEngine + CRDT + WebSocket sync
// This is the production-ready editing surface

import React, { useEffect, useState } from "react";
import { RichTextToolbar, EditorCommand } from "./rich-text-toolbar";
import { EditorEngine } from "./editor-engine";
import { CollaborationClient } from "../collaboration/websocket-client";
import { CRDTBinding } from "./crdt-binding";

export function EditorView() {
  const [engine] = useState(() => new EditorEngine());
  const [client] = useState(() => new CollaborationClient());
  const [binding, setBinding] = useState<CRDTBinding | null>(null);
  const [content, setContent] = useState("");

  useEffect(() => {
    client.connect();

    const b = new CRDTBinding(engine, client, "");
    setBinding(b);

    client.join("default_workspace", "doc_1", "user_local");

    return () => client.disconnect();
  }, [engine, client]);

  function onCommand(cmd: EditorCommand) {
    const updated = engine.applyCommand(cmd);
    setContent(updated.content);

    binding?.applyLocalEdit(
      updated.content,
      "user_local",
      "doc_1",
      "default_workspace"
    );
  }

  function onChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value;
    engine.setContent(value);
    setContent(value);

    binding?.applyLocalEdit(
      value,
      "user_local",
      "doc_1",
      "default_workspace"
    );
  }

  return (
    <div style={styles.container}>
      <RichTextToolbar onCommand={onCommand} />

      <textarea
        value={content}
        onChange={onChange}
        style={styles.editor}
        placeholder="Start writing..."
      />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  editor: {
    flex: 1,
    padding: "16px",
    fontSize: "16px",
    outline: "none",
    border: "none",
    resize: "none",
  },
};
