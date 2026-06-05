// Phase 33.2 - Document Service Layer
// Hydration + document orchestration for Notion-style editor

import { DBClient } from "../db/client";
import { Block } from "./block.model";

const TABLE = "documents";

export interface DocumentData {
  id: string;
  workspaceId: string;
  title: string;
  blocks: Block[];
  createdAt: number;
  updatedAt: number;
}

export class DocumentService {
  private static db() {
    return DBClient.get<any>(TABLE);
  }

  // CREATE DOCUMENT
  static async createDocument(input: {
    id: string;
    workspaceId: string;
    title: string;
  }): Promise<DocumentData> {
    const now = Date.now();

    const doc: DocumentData = {
      id: input.id,
      workspaceId: input.workspaceId,
      title: input.title,
      blocks: [],
      createdAt: now,
      updatedAt: now,
    };

    await this.db().create(doc);

    return doc;
  }

  // GET DOCUMENT (HYDRATED)
  static async getDocument(id: string): Promise<DocumentData | null> {
    const doc = await this.db().get(id);
    return doc?.data || null;
  }

  // UPDATE DOCUMENT METADATA
  static async updateDocument(
    id: string,
    updates: Partial<Pick<DocumentData, "title">>
  ): Promise<DocumentData | null> {
    const doc = await this.db().get(id);
    if (!doc) return null;

    const updated: DocumentData = {
      ...doc.data,
      ...updates,
      updatedAt: Date.now(),
    };

    await this.db().update(id, {
      ...doc,
      data: updated,
      updatedAt: Date.now(),
    });

    return updated;
  }

  // APPEND BLOCK
  static async appendBlock(documentId: string, block: Block) {
    const doc = await this.db().get(documentId);
    if (!doc) throw new Error("Document not found");

    const data: DocumentData = doc.data;

    data.blocks.push(block);
    data.updatedAt = Date.now();

    await this.db().update(documentId, {
      ...doc,
      data,
      updatedAt: Date.now(),
    });

    return block;
  }

  // DELETE DOCUMENT
  static async deleteDocument(id: string): Promise<boolean> {
    const res = await this.db().delete(id);
    return res;
  }
}
