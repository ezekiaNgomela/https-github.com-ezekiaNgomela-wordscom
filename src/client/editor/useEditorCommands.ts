// Phase 34.2 - Editor UX Engine (Commands + Slash System)
// Powers Notion-like slash commands and block creation logic

import { useState } from "react";

export type CommandType =
  | "paragraph"
  | "heading1"
  | "heading2"
  | "heading3"
  | "todo"
  | "quote"
  | "code"
  | "divider";

export interface EditorCommand {
  label: string;
  type: CommandType;
  description: string;
}

export const COMMANDS: EditorCommand[] = [
  { label: "Text", type: "paragraph", description: "Plain text block" },
  { label: "Heading 1", type: "heading1", description: "Large heading" },
  { label: "Heading 2", type: "heading2", description: "Medium heading" },
  { label: "Heading 3", type: "heading3", description: "Small heading" },
  { label: "To-do", type: "todo", description: "Task checkbox" },
  { label: "Quote", type: "quote", description: "Quote block" },
  { label: "Code", type: "code", description: "Code block" },
  { label: "Divider", type: "divider", description: "Horizontal line" },
];

export function useEditorCommands() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = COMMANDS.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  function openMenu() {
    setOpen(true);
  }

  function closeMenu() {
    setOpen(false);
    setQuery("");
  }

  function handleInput(text: string) {
    if (text.startsWith("/")) {
      setOpen(true);
      setQuery(text.slice(1));
    } else {
      setOpen(false);
    }
  }

  return {
    query,
    open,
    filtered,
    setQuery,
    openMenu,
    closeMenu,
    handleInput,
  };
}
