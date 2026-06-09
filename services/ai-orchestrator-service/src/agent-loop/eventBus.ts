export type EventType = "task_created" | "task_completed" | "task_failed" | "workflow_event";

export type Event = {
  id: string;
  type: EventType;
  payload: any;
  createdAt: number;
};

const listeners: Record<string, ((event: Event) => void)[]> = {};

export function emit(event: Event) {
  const subs = listeners[event.type] || [];
  subs.forEach(fn => fn(event));
}

export function on(eventType: EventType, handler: (event: Event) => void) {
  if (!listeners[eventType]) listeners[eventType] = [];
  listeners[eventType].push(handler);
}