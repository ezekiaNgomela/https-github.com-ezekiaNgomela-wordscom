// infra/eventStore.ts

export type EventType =
  | "COMMAND_CREATED"
  | "AI_REQUESTED"
  | "WORKER_ASSIGNED"
  | "WORKER_COMPLETED"
  | "STATE_UPDATED";

export interface BaseEvent<T = any> {
  id: string;
  type: EventType;
  entityId: string;
  version: number;
  timestamp: number;
  causalChainId: string;
  payload: T;
}

export interface EventStore {
  append(event: BaseEvent): Promise<void>;
  getStream(entityId: string): Promise<BaseEvent[]>;
  getLatestVersion(entityId: string): Promise<number>;
}

export class InMemoryEventStore implements EventStore {
  private store: Map<string, BaseEvent[]> = new Map();

  async append(event: BaseEvent): Promise<void> {
    const stream = this.store.get(event.entityId) || [];

    const lastVersion = stream.length
      ? stream[stream.length - 1].version
      : 0;

    if (event.version !== lastVersion + 1) {
      throw new Error("Out-of-order event detected");
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

export const eventStore = new InMemoryEventStore();