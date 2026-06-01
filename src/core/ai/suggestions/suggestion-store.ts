export interface AISuggestion {
  id: string;
  type: string;
  message?: string;
  suggestion?: string;
  blockId?: string;
  language?: string;
  timestamp: number;
  status: 'pending' | 'accepted' | 'rejected';
}

export class SuggestionStore {
  private suggestions: Map<string, AISuggestion> = new Map();

  add(suggestion: Omit<AISuggestion, 'id' | 'timestamp' | 'status'>) {
    const id = crypto.randomUUID();

    const full: AISuggestion = {
      ...suggestion,
      id,
      timestamp: Date.now(),
      status: 'pending',
    };

    this.suggestions.set(id, full);
    return full;
  }

  list() {
    return Array.from(this.suggestions.values());
  }

  updateStatus(id: string, status: AISuggestion['status']) {
    const item = this.suggestions.get(id);
    if (!item) return;

    item.status = status;
    this.suggestions.set(id, item);
  }

  getByBlock(blockId: string) {
    return this.list().filter(s => s.blockId === blockId);
  }
}
