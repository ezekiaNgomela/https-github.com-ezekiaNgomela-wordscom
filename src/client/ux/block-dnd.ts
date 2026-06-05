// Phase 25.2 - UX Polishing: Block Drag & Drop System
// Enables Notion-style reordering of structured document blocks
// Works on top of BlockDocument model

import { Block, BlockDocument } from "./block-model";

export interface DragState {
  draggingBlockId: string | null;
  overBlockId: string | null;
}

export class BlockDragDropSystem {
  private doc: BlockDocument;
  private state: DragState = {
    draggingBlockId: null,
    overBlockId: null,
  };

  constructor(doc: BlockDocument) {
    this.doc = doc;
  }

  startDrag(blockId: string) {
    this.state.draggingBlockId = blockId;
  }

  updateHover(blockId: string) {
    this.state.overBlockId = blockId;
  }

  endDrag() {
    const { draggingBlockId, overBlockId } = this.state;

    if (!draggingBlockId || !overBlockId) {
      this.reset();
      return;
    }

    const blocks = this.doc.getOrderedBlocks();

    const draggedIndex = blocks.findIndex((b) => b.id === draggingBlockId);
    const targetIndex = blocks.findIndex((b) => b.id === overBlockId);

    if (draggedIndex === -1 || targetIndex === -1) {
      this.reset();
      return;
    }

    const reordered = [...blocks];
    const [moved] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    reordered.forEach((b, i) => {
      this.doc.moveBlock(b.id, i);
    });

    this.reset();
  }

  reset() {
    this.state = {
      draggingBlockId: null,
      overBlockId: null,
    };
  }

  getState() {
    return this.state;
  }
}
