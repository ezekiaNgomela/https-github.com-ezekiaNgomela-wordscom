/**
 * eventBus.ts (LEGACY COMPATIBILITY LAYER)
 * -------------------------------------------------
 * This file now bridges legacy event system with EventStore.
 * Existing listeners remain functional while new system migrates.
 */

import { eventStore } from "./eventStore";
import { BaseEvent } from "./eventStore";

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

  on<T extends keyof EventMap>(event: T, handler: (payload: EventMap[T]) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler as EventHandler);
  }

  emit<T extends keyof EventMap>(event: T, payload: EventMap[T]) {
    const handlers = this.listeners.get(event);

    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(payload);
        } catch (err) {
          console.error(`[EventBus] handler error on ${event}:`, err);
        }
      }
    }

    const legacyEvent: BaseEvent = {
      id: crypto.randomUUID?.() ?? String(Date.now()),
      type: "STATE_UPDATED",
      entityId: "legacy",
      version: Date.now(),
      timestamp: Date.now(),
      causalChainId: "legacy",
      payload: { event, payload },
    };

    eventStore.append(legacyEvent).catch(() => {});
  }

  off<T extends keyof EventMap>(event: T, handler: EventHandler) {
    this.listeners.get(event)?.delete(handler);
  }
}

export const eventBus = new EventBus();