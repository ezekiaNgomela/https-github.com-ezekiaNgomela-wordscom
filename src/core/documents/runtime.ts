import type { Document, DocumentBlock, DocumentChange, DocumentVersion } from './types';

export class DocumentRuntime {
  private document: Document;

  constructor(document: Document) {
    this.document = document;
  }

  getDocument() {
    return this.document;
  }

  createVersion(message: string) {
    const version: DocumentVersion = {
      id: crypto.randomUUID(),
      documentId: this.document.id,
      timestamp: Date.now(),
      message,
      blocks: structuredClone(this.document.blocks),
    };

    this.document.versions.push(version);
    return version;
  }

  updateBlock(blockId: string, content: string, author: 'user' | 'ai' = 'user') {
    const block = this.document.blocks.find(b => b.id === blockId);
    if (!block) return null;

    const before = block.content;
    block.content = content;
    block.updatedAt = Date.now();

    const change: DocumentChange = {
      id: crypto.randomUUID(),
      blockId,
      type: 'update',
      before,
      after: content,
      timestamp: Date.now(),
      author,
    };

    this.document.changes.push(change);
    return block;
  }

  addBlock(block: DocumentBlock, author: 'user' | 'ai' = 'user') {
    this.document.blocks.push(block);

    this.document.changes.push({
      id: crypto.randomUUID(),
      blockId: block.id,
      type: 'insert',
      after: block.content,
      timestamp: Date.now(),
      author,
    });
  }

  deleteBlock(blockId: string, author: 'user' | 'ai' = 'user') {
    const index = this.document.blocks.findIndex(b => b.id === blockId);
    if (index < 0) return;

    const removed = this.document.blocks[index];
    this.document.blocks.splice(index, 1);

    this.document.changes.push({
      id: crypto.randomUUID(),
      blockId,
      type: 'delete',
      before: removed.content,
      timestamp: Date.now(),
      author,
    });
  }
}
