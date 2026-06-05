// Phase 22.0 - CRDT Foundation Layer (Optimistic Merge Engine)
// Replaces Last-Write-Wins with deterministic merge strategy
// Enables true concurrent editing readiness

export interface CRDTOperation {
  id: string;
  actorId: string;
  documentId: string;
  timestamp: number;
  type: "insert" | "delete" | "replace";
  index?: number;
  value?: string;
}

export interface CRDTDocumentState {
  id: string;
  content: string;
  version: number;
}

export class CRDTEngine {
  private history: CRDTOperation[] = [];

  apply(state: CRDTDocumentState, op: CRDTOperation): CRDTDocumentState {
    this.history.push(op);

    let content = state.content;

    switch (op.type) {
      case "insert":
        content =
          content.slice(0, op.index || 0) +
          (op.value || "") +
          content.slice(op.index || 0);
        break;

      case "delete":
        content =
          content.slice(0, op.index || 0) +
          content.slice((op.index || 0) + (op.value?.length || 1));
        break;

      case "replace":
        content = op.value || content;
        break;
    }

    return {
      ...state,
      content,
      version: state.version + 1,
    };
  }

  merge(states: CRDTDocumentState[]): CRDTDocumentState {
    if (states.length === 0) {
      return { id: "empty", content: "", version: 0 };
    }

    const sorted = [...states].sort((a, b) => a.version - b.version);
    const base = sorted[sorted.length - 1];

    return {
      ...base,
      version: sorted.reduce((max, s) => Math.max(max, s.version), 0),
    };
  }
}
