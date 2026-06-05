// Phase 25.1 - UX Polishing: Block Model System (Notion-style foundation)
// Introduces structural document blocks for drag/drop + rich editor evolution

export type BlockType =
  | "paragraph"
  | "heading"
  | "code"
  | "quote"
  | "list"
  | "divider";

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  parentId?: string | null;
  order: number;
  metadata?: {
    language?: string; // for code blocks
    level?: number; // for headings
  };
}

export class BlockDocument {
  private blocks: Map<string, Block> = new Map();

  constructor(initialBlocks: Block[] = []) {
    initialBlocks.forEach((b) => this.blocks.set(b.id, b));
  }

  addBlock(block: Block) {
    this.blocks.set(block.id, block);
  }

  updateBlock(id: string, content: Partial<Block>) {
    const existing = this.blocks.get(id);
    if (!existing) return;

    this.blocks.set(id, { ...existing, ...content });
  }

  deleteBlock(id: string) {
    this.blocks.delete(id);
  }

  moveBlock(id: string, newOrder: number) {
    const block = this.blocks.get(id);
    if (!block) return;

    block.order = newOrder;
    this.blocks.set(id, block);
  }

  getOrderedBlocks(): Block[] {
    return Array.from(this.blocks.values()).sort((a, b) => a.order - b.order);
  }

  toText(): string {
    return this.getOrderedBlocks()
      .map((b) => b.content)
      .join("\n");
  }
}
