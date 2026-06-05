// Phase 33.1 - Block Operations Engine
// Core CRUD + ordering logic for Notion-style editor

import { Block, BlockFactory } from "./block.model";
import crypto from "crypto";
import { DBClient } from "../db/client";

const TABLE = "documents";

export class BlockService {
  private static db() {
    return DBClient.get<any>(TABLE);
  }

  // CREATE BLOCK
  static async createBlock(input: {
    documentId: string;
    type: Block["type"];
    content?: string;
    position?: number;
    metadata?: any;
    parentId?: string | null;
  }): Promise<Block> {
    const block = BlockFactory.create({
      documentId: input.documentId,
      type: input.type,
      content: input.content,
      position: input.position,
      metadata: input.metadata,
      parentId: input.parentId,
    } as any);

    const doc = await this.db().get(input.documentId);

    const updatedBlocks = doc?.data?.blocks || [];
    updatedBlocks.splice(block.position, 0, block);

    await this.db().update(input.documentId, {
      ...doc,
      data: {
        ...(doc?.data || {}),
        blocks: updatedBlocks,
      },
      updatedAt: Date.now(),
    });

    return block;
  }

  // GET ALL BLOCKS IN DOCUMENT
  static async getBlocks(documentId: string): Promise<Block[]> {
    const doc = await this.db().get(documentId);
    return doc?.data?.blocks || [];
  }

  // UPDATE BLOCK
  static async updateBlock(
    documentId: string,
    blockId: string,
    updates: Partial<Block>
  ): Promise<Block | null> {
    const doc = await this.db().get(documentId);
    if (!doc?.data?.blocks) return null;

    const blocks: Block[] = doc.data.blocks;

    const index = blocks.findIndex((b) => b.id === blockId);
    if (index === -1) return null;

    blocks[index] = {
      ...blocks[index],
      ...updates,
      updatedAt: Date.now(),
    };

    await this.db().update(documentId, {
      ...doc,
      data: {
        ...doc.data,
        blocks,
      },
      updatedAt: Date.now(),
    });

    return blocks[index];
  }

  // DELETE BLOCK
  static async deleteBlock(documentId: string, blockId: string): Promise<boolean> {
    const doc = await this.db().get(documentId);
    if (!doc?.data?.blocks) return false;

    const blocks: Block[] = doc.data.blocks;
    const filtered = blocks.filter((b) => b.id !== blockId);

    await this.db().update(documentId, {
      ...doc,
      data: {
        ...doc.data,
        blocks: filtered,
      },
      updatedAt: Date.now(),
    });

    return true;
  }

  // REORDER BLOCKS
  static async reorderBlocks(documentId: string, orderedIds: string[]) {
    const doc = await this.db().get(documentId);
    if (!doc?.data?.blocks) return;

    const blocks: Block[] = doc.data.blocks;

    const map = new Map(blocks.map((b) => [b.id, b]));

    const reordered = orderedIds
      .map((id, index) => {
        const block = map.get(id);
        if (!block) return null;
        return { ...block, position: index };
      })
      .filter(Boolean) as Block[];

    await this.db().update(documentId, {
      ...doc,
      data: {
        ...doc.data,
        blocks: reordered,
      },
      updatedAt: Date.now(),
    });

    return reordered;
  }
}
