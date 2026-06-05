// Phase 20 - Rich Text Document Engine (Core Editor Layer)
// Provides document model, operations, and UI persistence foundation
// This is the base for WordCom real editor (Notion-like structure)

export type DocNodeType = "paragraph" | "text";

export interface DocNode {
  id: string;
  type: DocNodeType;
  text?: string;
  children?: DocNode[];
}

export interface DocumentModel {
  id: string;
  title: string;
  root: DocNode[];
  createdAt: number;
  updatedAt: number;
}

export interface EditorState {
  document: DocumentModel;
  selection: {
    nodeId: string | null;
    offset: number;
  };
}

export class DocumentEngine {
  private state: EditorState;
  private listeners: ((state: EditorState) => void)[] = [];

  constructor() {
    const saved = this.load();
    this.state = saved || this.createEmptyDocument();
  }

  private createEmptyDocument(): EditorState {
    return {
      document: {
        id: `doc_${Date.now()}`,
        title: "Untitled",
        root: [
          { id: "p1", type: "paragraph", text: "" }
        ],
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      selection: {
        nodeId: "p1",
        offset: 0
      }
    };
  }

  getState(): EditorState {
    return this.state;
  }

  subscribe(fn: (state: EditorState) => void) {
    this.listeners.push(fn);
  }

  private emit() {
    for (const fn of this.listeners) fn(this.state);
    this.save();
  }

  insertText(nodeId: string, text: string) {
    const node = this.findNode(nodeId, this.state.document.root);
    if (!node || node.type !== "paragraph") return;

    node.text = (node.text || "") + text;
    this.state.document.updatedAt = Date.now();
    this.emit();
  }

  setText(nodeId: string, text: string) {
    const node = this.findNode(nodeId, this.state.document.root);
    if (!node || node.type !== "paragraph") return;

    node.text = text;
    this.state.document.updatedAt = Date.now();
    this.emit();
  }

  private findNode(id: string, nodes: DocNode[]): DocNode | null {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = this.findNode(id, node.children);
        if (found) return found;
      }
    }
    return null;
  }

  setSelection(nodeId: string, offset: number) {
    this.state.selection = { nodeId, offset };
    this.emit();
  }

  private save() {
    try {
      localStorage.setItem("wordcom_document", JSON.stringify(this.state));
    } catch {}
  }

  private load(): EditorState | null {
    try {
      const raw = localStorage.getItem("wordcom_document");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
