// Phase 25.0 - UX Polishing: Cursor Presence System
// Enables real-time multi-user cursor + selection visualization
// Critical for Google Docs / Notion-level collaboration feel

export interface CursorPosition {
  userId: string;
  workspaceId: string;
  documentId: string;
  index: number;
  selectionEnd?: number;
  color: string;
  name?: string;
}

export class CursorPresenceSystem {
  private cursors: Map<string, CursorPosition> = new Map();

  private key(userId: string, docId: string) {
    return `${userId}:${docId}`;
  }

  updateCursor(cursor: CursorPosition) {
    const k = this.key(cursor.userId, cursor.documentId);
    this.cursors.set(k, cursor);
  }

  removeCursor(userId: string, documentId: string) {
    this.cursors.delete(this.key(userId, documentId));
  }

  getCursors(documentId: string): CursorPosition[] {
    return Array.from(this.cursors.values()).filter(
      (c) => c.documentId === documentId
    );
  }

  clearStale(documentId: string, maxAgeMs = 30000) {
    // placeholder for future heartbeat-based cleanup
    const now = Date.now();

    for (const [k, v] of this.cursors.entries()) {
      if (v.documentId === documentId && now - (v as any).timestamp > maxAgeMs) {
        this.cursors.delete(k);
      }
    }
  }
}
