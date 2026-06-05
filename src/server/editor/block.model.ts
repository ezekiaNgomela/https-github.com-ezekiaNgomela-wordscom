// Phase 33 - Notion-style Editor Engine (Core Block Model)
// Foundation for WordCom document editing system

export type BlockType =
  | "paragraph"
  | "heading1"
  | "heading2"
  | "heading3"
  | "bullet_list"
  | "numbered_list"
  | "todo"
  | "quote"
  | "code"
  | "divider"
  | "image";

export interface Block {
  id: string;
  documentId: string;
  type: BlockType;
  content: string;
  parentId?: string | null;
  position: number;
  metadata?: {
    checked?: boolean;
    language?: string;
    url?: string;
  };
  createdAt: number;
  updatedAt: number;
}

export interface Document {
  id: string;
  workspaceId: string;
  title: string;
  blockOrder: string[];
  createdAt: number;
  updatedAt: number;
}

export class BlockFactory {
  static create(input: Partial<Block> & { documentId: string; type: BlockType; content?: string }): Block {
    const now = Date.now();

    return {
      id: crypto.randomUUID(),
      documentId: input.documentId,
      type: input.type,
      content: input.content || "",
      parentId: input.parentId || null,
      position: input.position ?? 0,
      metadata: input.metadata || {},
      createdAt: now,
      updatedAt: now,
    };
  }
}
