// Phase 24.2 - Production Scaling: Event Audit Log System
// Provides append-only event history for debugging, replay, and compliance
// Works alongside EventQueue for full system observability

export interface AuditEvent {
  id: string;
  type: "auth" | "ws" | "ai" | "document" | "system";
  userId?: string;
  workspaceId?: string;
  action: string;
  payload?: any;
  timestamp: number;
}

export class EventAuditLog {
  private log: AuditEvent[] = [];

  append(event: Omit<AuditEvent, "timestamp">) {
    this.log.push({
      ...event,
      timestamp: Date.now(),
    });
  }

  query(filter?: {
    type?: AuditEvent["type"];
    userId?: string;
    workspaceId?: string;
  }) {
    return this.log.filter((e) => {
      if (filter?.type && e.type !== filter.type) return false;
      if (filter?.userId && e.userId !== filter.userId) return false;
      if (filter?.workspaceId && e.workspaceId !== filter.workspaceId) return false;
      return true;
    });
  }

  export() {
    return [...this.log];
  }
}
