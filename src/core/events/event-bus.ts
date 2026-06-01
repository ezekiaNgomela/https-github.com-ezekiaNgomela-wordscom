export type EventHandler<T = any> = (payload: T) => void;

export interface EventMap {
  [event: string]: any;
}

export class EventBus {
  private listeners: Map<string, Set<EventHandler>> = new Map();

  on<T = any>(event: string, handler: EventHandler<T>) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)!.add(handler as EventHandler);
  }

  off<T = any>(event: string, handler: EventHandler<T>) {
    this.listeners.get(event)?.delete(handler as EventHandler);
  }

  emit<T = any>(event: string, payload?: T) {
    const handlers = this.listeners.get(event);
    if (!handlers) return;

    for (const handler of handlers) {
      handler(payload);
    }
  }

  clear(event?: string) {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}
