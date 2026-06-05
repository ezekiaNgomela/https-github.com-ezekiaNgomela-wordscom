// Phase 24.0 - Production Scaling: Event Queue System
// Provides reliable async processing for collaboration + AI + sync events
// Adds retry + backpressure handling foundation

export type QueueEventType = "ai" | "sync" | "collaboration" | "audit";

export interface QueueEvent {
  id: string;
  type: QueueEventType;
  payload: any;
  attempts: number;
  createdAt: number;
}

export class EventQueue {
  private queue: QueueEvent[] = [];
  private processing = false;

  enqueue(event: Omit<QueueEvent, "attempts" | "createdAt">) {
    this.queue.push({
      ...event,
      attempts: 0,
      createdAt: Date.now(),
    });
  }

  async process(handler: (event: QueueEvent) => Promise<void>) {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const event = this.queue.shift();
      if (!event) continue;

      try {
        await handler(event);
      } catch (err) {
        event.attempts++;

        // retry with simple backoff
        if (event.attempts < 3) {
          this.queue.push(event);
        }
      }
    }

    this.processing = false;
  }

  size() {
    return this.queue.length;
  }
}
