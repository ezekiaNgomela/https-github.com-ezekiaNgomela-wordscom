import { publish } from "../core/messageBus";

/**
 * Phase 15: Queue Abstraction Layer
 * - In-memory queue (current)
 * - Future: Redis / NATS adapter
 */

export type QueuedTask = {
  id: string;
  type: "task" | "execution" | "memory" | "validation";
  payload: any;
  priority?: number;
  createdAt: number;
};

class MemoryQueue {
  private queue: QueuedTask[] = [];

  enqueue(task: QueuedTask) {
    this.queue.push(task);

    publish({
      id: `queue-${Date.now()}`,
      type: "system_event",
      payload: { stage: "task_enqueued", task },
      timestamp: Date.now()
    });
  }

  dequeue(): QueuedTask | undefined {
    return this.queue.sort((a, b) => (b.priority || 0) - (a.priority || 0))[0];
  }

  size() {
    return this.queue.length;
  }
}

export const queue = new MemoryQueue();
