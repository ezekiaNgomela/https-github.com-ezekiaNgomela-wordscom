import { publish } from "../core/messageBus";
import { Queue } from "./queueInterface";

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

class MemoryQueue implements Queue<QueuedTask> {
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
    if (this.queue.length === 0) return undefined;

    // Select highest priority task without mutating original order prematurely
    const sorted = [...this.queue].sort(
      (a, b) => (b.priority || 0) - (a.priority || 0)
    );

    const task = sorted[0];
    if (!task) return undefined;

    const index = this.queue.findIndex(t => t.id === task.id);
    if (index !== -1) {
      this.queue.splice(index, 1);
    }

    return task;
  }

  size() {
    return this.queue.length;
  }
}

export const queue = new MemoryQueue();