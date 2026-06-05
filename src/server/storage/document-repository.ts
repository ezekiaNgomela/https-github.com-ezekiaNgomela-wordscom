// Phase 20.5.4 - Persistent Document Repository Layer
// DB-backed abstraction for document storage (Postgres-ready, in-memory fallback)
// Replaces localStorage persistence with server-side persistence foundation

import { DocumentModel } from "../../client/editor/document-engine";

export interface DocumentRepository {
  getDocument(id: string): Promise<DocumentModel | null>;
  saveDocument(doc: DocumentModel): Promise<void>;
  listDocuments(workspaceId: string): Promise<DocumentModel[]>;
}

export class InMemoryDocumentRepository implements DocumentRepository {
  private store = new Map<string, DocumentModel>();

  async getDocument(id: string): Promise<DocumentModel | null> {
    return this.store.get(id) || null;
  }

  async saveDocument(doc: DocumentModel): Promise<void> {
    doc.updatedAt = Date.now();
    this.store.set(doc.id, doc);
  }

  async listDocuments(): Promise<DocumentModel[]> {
    return Array.from(this.store.values());
  }
}

export class PostgresDocumentRepository implements DocumentRepository {
  async getDocument(id: string): Promise<DocumentModel | null> {
    return null;
  }

  async saveDocument(doc: DocumentModel): Promise<void> {
    console.log("[PostgresRepo] saveDocument not implemented", doc.id);
  }

  async listDocuments(workspaceId: string): Promise<DocumentModel[]> {
    return [];
  }
}

export function createDocumentRepository(): DocumentRepository {
  const mode = process.env.DB_MODE || "memory";

  if (mode === "postgres") {
    return new PostgresDocumentRepository();
  }

  return new InMemoryDocumentRepository();
}
