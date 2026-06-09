export type EventPayload = {
  type: string;
  data: any;
};

export class EventBus {
  private static handlers: Record<string, Function[]> = {};

  static emit(event: EventPayload) {
    const list = this.handlers[event.type] || [];
    for (const fn of list) fn(event.data);
  }

  static on(type: string, handler: Function) {
    if (!this.handlers[type]) this.handlers[type] = [];
    this.handlers[type].push(handler);
  }
}
