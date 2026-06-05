// Phase 34.3 - Block Interaction Engine (Keyboard + Notion-like behavior)
// Handles Enter, Backspace, navigation, and block splitting/merging

import { useCallback } from "react";

export interface Block {
  id: string;
  content: string;
}

export function useBlockInteractions(opts: {
  blocks: Block[];
  setBlocks: (b: Block[]) => void;
  onCreateBlock?: (afterId: string, content: string) => void;
  onDeleteBlock?: (id: string) => void;
}) {
  const splitBlock = useCallback(
    (blockId: string, cursorPos: number) => {
      const block = opts.blocks.find((b) => b.id === blockId);
      if (!block) return;

      const before = block.content.slice(0, cursorPos);
      const after = block.content.slice(cursorPos);

      const newBlocks = opts.blocks.map((b) =>
        b.id === blockId ? { ...b, content: before } : b
      );

      const newBlock: Block = {
        id: crypto.randomUUID(),
        content: after,
      };

      const index = newBlocks.findIndex((b) => b.id === blockId);
      newBlocks.splice(index + 1, 0, newBlock);

      opts.setBlocks(newBlocks);
    },
    [opts]
  );

  const mergeBlockWithPrevious = useCallback(
    (blockId: string) => {
      const index = opts.blocks.findIndex((b) => b.id === blockId);
      if (index <= 0) return;

      const current = opts.blocks[index];
      const prev = opts.blocks[index - 1];

      const merged: Block = {
        ...prev,
        content: prev.content + current.content,
      };

      const updated = [...opts.blocks];
      updated[index - 1] = merged;
      updated.splice(index, 1);

      opts.setBlocks(updated);
    },
    [opts]
  );

  const handleKeyDown = useCallback(
    (e: any, blockId: string) => {
      if (e.key === "Enter") {
        e.preventDefault();

        const selection = window.getSelection();
        const cursorPos = selection?.anchorOffset || 0;

        splitBlock(blockId, cursorPos);
      }

      if (e.key === "Backspace") {
        const block = opts.blocks.find((b) => b.id === blockId);
        if (block?.content.length === 0) {
          e.preventDefault();
          mergeBlockWithPrevious(blockId);
        }
      }
    },
    [opts, splitBlock, mergeBlockWithPrevious]
  );

  return {
    splitBlock,
    mergeBlockWithPrevious,
    handleKeyDown,
  };
}
