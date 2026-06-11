/**
 * executionLedger.ts
 * -------------------------------------------------
 * Phase 4: Execution Observability Layer
 *
 * Captures full trace of:
 * - Event received
 * - Worker execution result
 * - Success/failure state
 *
 * This is required for replayability and debugging.
 */

export type ExecutionRecord = {
  eventId: string;
  entityId: string;
  type: string;
  timestamp: number;
  success: boolean;
  output?: any;
  error?: string;
};

export class ExecutionLedger {
  private records: ExecutionRecord[] = [];

  record(entry: ExecutionRecord) {
    this.records.push(entry);
  }

  getAll(): ExecutionRecord[] {
    return this.records;
  }

  getByEvent(eventId: string): ExecutionRecord | undefined {
    return this.records.find(r => r.eventId === eventId);
  }

  clear() {
    this.records = [];
  }
}

export const executionLedger = new ExecutionLedger();