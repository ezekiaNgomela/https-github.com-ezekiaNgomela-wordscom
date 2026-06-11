/**
 * persistentEventStore.ts
 * -------------------------------------------------
 * Phase 6: Persistent Event Store Abstraction
 *
 * Replaces in-memory EventStore with pluggable persistence layer.
 * This is the bridge to Redis / Postgres / Kafka.
 */

import { BaseEvent, EventStore } from './eventStore';

/**
 * Storage adapter interface (future Redis/Postgres/Kafka)
 */
export interface EventStorageAdapter {
  append(event: BaseEvent): Promise<void>;
  getStream(entityId: string): Promise<BaseEvent[]>;
  getLatestVersion(entityId: string): Promise<number>;
}

/**
 * In-memory adapter (current fallback)
 */
export class InMemoryAdapter implements EventStorageAdapter {
  private store: Map<string, BaseEvent[]> = new Map();

  async append(event: BaseEvent): Promise<void> {
    const stream = this.store.get(event.entityId) || [];

    const lastVersion = stream.length
      ? stream[stream.length - 1].version
      : 0;

    if (event.version !== lastVersion + 1) {
      throw new Error('Out-of-order event detected');
    }

    stream.push(event);
    this.store.set(event.entityId, stream);
  }

  async getStream(entityId: string): Promise<BaseEvent[]> {
    return this.store.get(entityId) || [];
  }

  async getLatestVersion(entityId: string): Promise<number> {
    const stream = this.store.get(entityId);
    return stream?.length ? stream[stream.length - 1].version : 0;
  }
}

/**
 * Persistent Event Store wrapper
 */
export class PersistentEventStore implements EventStore {
  constructor(private adapter: EventStorageAdapter) {}

  async append(event: BaseEvent): Promise<void> {
    return this.adapter.append(event);
  }

  async getStream(entityId: string): Promise<BaseEvent[]> {
    return this.adapter.getStream(entityId);
  }

  async getLatestVersion(entityId: string): Promise<number> {
    return this.adapter.getLatestVersion(entityId);
  }
}

/**
 * Default in-memory instance (swap later with Redis/Postgres)
 */
export const persistentEventStore = new PersistentEventStore(
  new InMemoryAdapter()
);