// Phase 25.3 - UX Polishing: Multi-user Selection Rendering System
// Renders real-time selections from multiple users in collaborative editor
// Works with CursorPresenceSystem + BlockModel

export interface TextSelection {
  userId: string;
  documentId: string;
  blockId?: string;
  startIndex: number;
  endIndex: number;
  color: string;
  name?: string;
}

export class SelectionRenderer {
  private selections: Map<string, TextSelection> = new Map();

  private key(userId: string, docId: string) {
    return `${userId}:${docId}`;
  }

  updateSelection(sel: TextSelection) {
    this.selections.set(this.key(sel.userId, sel.documentId), sel);
  }

  removeSelection(userId: string, documentId: string) {
    this.selections.delete(this.key(userId, documentId));
  }

  getSelections(documentId: string): TextSelection[] {
    return Array.from(this.selections.values()).filter(
      (s) => s.documentId === documentId
    );
  }

  mergeSelections(selections: TextSelection[]): TextSelection[] {
    return selections
      .sort((a, b) => a.startIndex - b.startIndex)
      .map((s) => ({
        ...s,
        startIndex: Math.max(0, s.startIndex),
        endIndex: Math.max(s.startIndex, s.endIndex),
      }));
  }

  clearStale(documentId: string) {
    for (const [k, v] of this.selections.entries()) {
      if (v.documentId === documentId && v.endIndex === v.startIndex) {
        this.selections.delete(k);
      }
    }
  }
}
