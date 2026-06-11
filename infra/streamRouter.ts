// infra/streamRouter.ts

import { BaseEvent } from "./eventStore";

/**
 * Determines partition key for deterministic ordering.
 * Ensures events for same entity are processed sequentially.
 */
export function getPartitionKey(event: BaseEvent): string {
  return `${event.type}:${event.entityId}`;
}

export type StreamPartition = {
  key: string;
  events: BaseEvent[];
};

export class StreamRouter {
  private partitions: Map<string, BaseEvent[]> = new Map();

  route(event: BaseEvent) {
    const key = getPartitionKey(event);

    if (!this.partitions.has(key)) {
      this.partitions.set(key, []);
    }

    this.partitions.get(key)!.push(event);
  }

  getPartition(key: string): BaseEvent[] {
    return this.partitions.get(key) || [];
  }
}

export const streamRouter = new StreamRouter();