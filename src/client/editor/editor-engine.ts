// Phase 21.5 - Editor Command Execution Layer
// Bridges RichTextToolbar → DocumentEngine mutations
// Provides local in-memory document state + formatting operations

export type EditorCommand =
  | "bold"
  | "italic"
  | "h1"
  | "h2"
  | "bulletList"
  | "numberedList"
  | "codeBlock";

export interface DocumentState {
  id: string;
  content: string;
}

export class EditorEngine {
  private doc: DocumentState;

  constructor(initialDoc?: DocumentState) {
    this.doc = initialDoc || {
      id: "default",
      content: "",
    };
  }

  getDocument() {
    return this.doc;
  }

  setContent(content: string) {
    this.doc.content = content;
  }

  applyCommand(cmd: EditorCommand) {
    const c = this.doc.content;

    switch (cmd) {
      case "bold":
        this.doc.content = `**${c}**`;
        break;
      case "italic":
        this.doc.content = `_${c}_`;
        break;
      case "h1":
        this.doc.content = `# ${c}`;
        break;
      case "h2":
        this.doc.content = `## ${c}`;
        break;
      case "bulletList":
        this.doc.content = c.split("\n").map(l => `- ${l}`).join("\n");
        break;
      case "numberedList":
        this.doc.content = c.split("\n").map((l,i)=>`${i+1}. ${l}`).join("\n");
        break;
      case "codeBlock":
        this.doc.content = "```\n" + c + "\n```";
        break;
    }

    return this.doc;
  }
}
