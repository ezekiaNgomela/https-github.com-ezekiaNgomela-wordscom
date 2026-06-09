export type MessageType = "task" | "agent_event" | "memory_event" | "execution_event" | "system_event";

export type Message = {
  id: string;
  type: MessageType;
  from?: string;
  to?: string;
  payload: any;
  timestamp: number;
};

const subscribers: Record<string, ((msg: Message) => void)[]> = {};

export function publish(message: Message) {
  const handlers = subscribers[message.type] || [];
  for (const fn of handlers) fn(message);
}

export function subscribe(type: MessageType, handler: (msg: Message) => void) {
  if (!subscribers[type]) subscribers[type] = [];
  subscribers[type].push(handler);
}

export function unsubscribe(type: MessageType, handler: (msg: Message) => void) {
  const list = subscribers[type];
  if (!list) return;
  subscribers[type] = list.filter(h => h !== handler);
}