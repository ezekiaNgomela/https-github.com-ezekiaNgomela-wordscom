// Phase 21.4 - Rich Text Editor Toolbar Layer
// Provides formatting controls for WordCom document editor
// Supports bold, headings, lists, and block formatting commands

import React from "react";

export type EditorCommand =
  | "bold"
  | "italic"
  | "h1"
  | "h2"
  | "bulletList"
  | "numberedList"
  | "codeBlock";

interface ToolbarProps {
  onCommand: (cmd: EditorCommand) => void;
}

export function RichTextToolbar({ onCommand }: ToolbarProps) {
  return (
    <div style={styles.toolbar}>
      <button onClick={() => onCommand("bold")}>B</button>
      <button onClick={() => onCommand("italic")}>I</button>
      <button onClick={() => onCommand("h1")}>H1</button>
      <button onClick={() => onCommand("h2")}>H2</button>
      <button onClick={() => onCommand("bulletList")}>• List</button>
      <button onClick={() => onCommand("numberedList")}>1. List</button>
      <button onClick={() => onCommand("codeBlock")}>{"</>"}</button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  toolbar: {
    display: "flex",
    gap: "8px",
    padding: "8px",
    borderBottom: "1px solid #333",
    backgroundColor: "#111",
    color: "white",
  },
};