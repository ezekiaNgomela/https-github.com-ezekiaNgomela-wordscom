/**
 * eventBus.ts
 * -------------------------------------------------
 * Lightweight internal event bus
 * Used to decouple:
 * - WorkerProcessManager events
 * - ExecutionBridge signals
 * - ControlLoop feedback system
 *
 * Phase 6 foundation for observability + adaptive scaling
 */

type EventHandler = (payload: any) => void;

type EventMap = {
  job_result: any;
  worker_heartbeat: any;
  worker_spawned: any;
  worker_failed: any;
  system_metrics: any;
};

class EventBus {
  private listeners: Map<string, Set<EventHandler>> = new Map();

  /**
   * Subscribe to event
   */
  on<T extends keyof EventMap>(event: T, handler: (payload: EventMap[T]) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler as EventHandler);
  }

  /**
   * Emit event
   */
  emit<T extends keyof EventMap>(event: T, payload: EventMap[T]) {
    const handlers = this.listeners.get(event);
    if (!handlers) return;

    for (const handler of handlers) {
      try {
        handler(payload);
      } catch (err) {
        console.error(`[EventBus] handler error on ${event}:`, err);
      }
    }
  }

  /**
   * Remove listener
   */
  off<T extends keyof EventMap>(event: T, handler: EventHandler) {
    this.listeners.get(event)?.delete(handler);
  }
}

export const eventBus = new EventBus();
