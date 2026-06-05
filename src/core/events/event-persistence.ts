// Phase 9 Core Layer - Event Persistence System
// Safety-first additive architecture (durable system event log for replay, debugging, AI reasoning)

export type SystemEventType =
  | "document_created"
  | "document_updated"
  | "workspace_updated"
  | "memory_written"
  | "sync_operation"
  | "ai_action"
  | "version_created"
  | "user_action";

export interface SystemEvent {
  id: string;
  type: SystemEventType;
  entityType: "document" | "workspace" | "memory" | "event" | "version" | "agent";
  entityId: string;
  payload?: any;
  timestamp: number;
  userId?: string;
  workspaceId?: string;
}

export interface EventQueryFilter {
  type?: SystemEventType;
  entityType?: string;
  entityId?: string;
  workspaceId?: string;
  from?: number;
  to?: number;
}

export interface EventAdapter {
  append: (event: SystemEvent) => Promise<void>;
  query: (filter: EventQueryFilter) => Promise<SystemEvent[]>;
  replay?: (from: number, to: number) => Promise<SystemEvent[]>;
}

export class EventPersistence {
  private buffer: SystemEvent[] = [];

  constructor(private adapter?: EventAdapter) {}

  // -------------------------
  // WRITE EVENT
  // -------------------------

  async emit(event: Omit<SystemEvent, "id" | "timestamp">) {
    const fullEvent: SystemEvent = {
      id: `evt_${Date.now()}_${Math.random()}`,
      timestamp: Date.now(),
      ...event,
    };

    // local buffer (fast access)
    this.buffer.push(fullEvent);

    // persistent storage
    if (this.adapter) {
      await this.adapter.append(fullEvent);
    }

    return fullEvent;
  }

  // -------------------------
  // READ EVENTS
  // -------------------------

  async query(filter: EventQueryFilter = {}): Promise<SystemEvent[]> {
    if (!this.adapter) {
      // fallback to local buffer
      return this.buffer.filter(e => this.matchFilter(e, filter));
    }

    return this.adapter.query(filter);
  }

  // -------------------------
  // REPLAY ENGINE
  // -------------------------

  async replay(from: number, to: number): Promise<SystemEvent[]> {
    if (this.adapter?.replay) {
      return this.adapter.replay(from, to);
    }

    return this.buffer.filter(
      e => e.timestamp >= from && e.timestamp <= to
    );
  }

  // -------------------------
  // INTERNAL FILTER
  // -------------------------

  private matchFilter(event: SystemEvent, filter: EventQueryFilter): boolean {
    if (filter.type && event.type !== filter.type) return false;
    if (filter.entityType && event.entityType !== filter.entityType) return false;
    if (filter.entityId && event.entityId !== filter.entityId) return false;
    if (filter.workspaceId && event.workspaceId !== filter.workspaceId) return false;
    if (filter.from && event.timestamp < filter.from) return false;
    if (filter.to && event.timestamp > filter.to) return false;
    return true;
  }

  // -------------------------
  // SYSTEM HELPERS
  // -------------------------

  getBufferedEvents(): SystemEvent[] {
    return this.buffer;
  }

  clearBuffer() {
    this.buffer = [];
  }
}
