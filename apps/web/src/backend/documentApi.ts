import type { Document } from "./types";
import { apiGet, apiPost } from "./apiClient";

/**
 * Document API layer
 * Falls back to localStorage if backend is unavailable
 */

export async function getDocument(id: string): Promise<Document> {
  try {
    return await apiGet(`/documents/${id}`);
  } catch {
    const local = localStorage.getItem(`doc:${id}`);
    if (local) return JSON.parse(local);

    return {
      id,
      content: "",
      updatedAt: Date.now(),
    };
  }
}

export async function saveDocument(doc: Document): Promise<void> {
  try {
    await apiPost(`/documents/${doc.id}`, doc);
  } catch {
    localStorage.setItem(`doc:${doc.id}`, JSON.stringify(doc));
  }
}