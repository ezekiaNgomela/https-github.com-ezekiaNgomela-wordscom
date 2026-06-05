// Phase 13 - PostgreSQL Event Adapter
// Wires EventPersistence system to real PostgreSQL storage layer
// Enables durable event sourcing for Sync, AI, and Version systems

import { EventAdapter, SystemEvent, EventQueryFilter } from "../../core/events/event-persistence";
import { PostgresAdapter } from "./postgres-adapter";

export interface PostgresEventAdapterConfig {
  table?: string;
  postgres: PostgresAdapter;
}

export class PostgresEventAdapter implements EventAdapter {
  private table: string;

  constructor(private config: PostgresEventAdapterConfig) {
    this.table = config.table || "system_events";
  }

  async append(event: SystemEvent): Promise<void> {
    await this.config.postgres.insert(this.table, {
      id: event.id,
      type: event.type,
      data: event.payload,
      workspaceId: event.workspaceId,
      createdAt: event.timestamp,
    });
  }

  async query(filter: EventQueryFilter): Promise<SystemEvent[]> {
    const rows = await this.config.postgres.query(this.table, filter as any);

    return rows.map((r: any) => ({
      id: r.id,
      type: r.type,
      entityType: r.data?.entityType || "event",
      entityId: r.data?.entityId || "unknown",
      payload: r.data,
      timestamp: r.createdAt,
      workspaceId: r.workspaceId,
    }));
  }

  async replay(from: number, to: number): Promise<SystemEvent[]> {
    const rows = await this.config.postgres.query(this.table, { from, to } as any);

    return rows
      .filter((r: any) => r.createdAt >= from && r.createdAt <= to)
      .map((r: any) => ({
        id: r.id,
        type: r.type,
        entityType: r.data?.entityType || "event",
        entityId: r.data?.entityId || "unknown",
        payload: r.data,
        timestamp: r.createdAt,
        workspaceId: r.workspaceId,
      }));
  }
}
