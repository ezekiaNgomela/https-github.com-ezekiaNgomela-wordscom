// Phase 26.0 - Performance Optimization: Batch Manager
// Reduces WebSocket + AI + sync overhead via intelligent batching
// Core scaling primitive for production workloads

export interface BatchedItem<T = any> {
  id: string;
  payload: T;
  timestamp: number;
}

export class BatchManager<T = any> {
  private queue: BatchedItem<T>[] = [];
  private timer: any = null;

  constructor(
    private flushIntervalMs = 50,
    private maxBatchSize = 20,
    private handler: (items: BatchedItem<T>[]) => Promise<void>
  ) {}

  add(item: T, id: string) {
    this.queue.push({
      id,
      payload: item,
      timestamp: Date.now(),
    });

    this.scheduleFlush();
  }

  private scheduleFlush() {
    if (this.timer) return;

    this.timer = setTimeout(() => this.flush(), this.flushIntervalMs);
  }

  async flush() {
    if (this.queue.length === 0) {
      this.timer = null;
      return;
    }

    const batch = this.queue.splice(0, this.maxBatchSize);

    try {
      await this.handler(batch);
    } catch (err) {
      // requeue failed batch for retry
      this.queue.unshift(...batch);
    }

    this.timer = null;

    if (this.queue.length > 0) {
      this.scheduleFlush();
    }
  }

  size() {
    return this.queue.length;
  }
}
