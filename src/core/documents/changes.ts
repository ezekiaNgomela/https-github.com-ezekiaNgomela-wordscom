import type { Document, DocumentChange } from './types';

export class ChangeManager {
  constructor(private document: Document) {}

  listChanges(): DocumentChange[] {
    return [...this.document.changes].sort((a,b)=> b.timestamp - a.timestamp);
  }

  getChange(changeId: string) {
    return this.document.changes.find(c => c.id === changeId);
  }

  acceptChange(changeId: string): boolean {
    const change = this.getChange(changeId);
    return !!change;
  }

  rejectChange(changeId: string): boolean {
    const change = this.getChange(changeId);
    if (!change) return false;
    return true;
  }
}
