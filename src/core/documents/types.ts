// WordCom Core Document Engine - Phase 1
// Block-based document model for AI editing, tracking, and conversion

export type BlockType =
  | "paragraph"
  | "heading"
  | "list"
  | "code"
  | "quote"
  | "table"
  | "image";

export interface DocumentBlock {
  id: string;
  type: BlockType;
  content: string;
  meta?: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  timestamp: number;
  message: string;
  blocks: DocumentBlock[];
}

export interface DocumentChange {
  id: string;
  blockId: string;
  type: "insert" | "update" | "delete";
  before?: string;
  after?: string;
  timestamp: number;
  author: "user" | "ai";
}

export interface Document {
  id: string;
  title: string;
  blocks: DocumentBlock[];
  versions: DocumentVersion[];
  changes: DocumentChange[];
  createdAt: number;
  updatedAt: number;
}

export interface AISuggestion {
  id: string;
  type: "rewrite" | "structure" | "grammar" | "tone";
  blockId?: string;
  message: string;
  confidence: number;
  createdAt: number;
}
