export type MemoryRecord = {
  id: string;
  userId?: string;
  sessionId?: string;
  type: "session" | "workflow" | "tool_result" | "note";
  data: any;
  createdAt: number;
};

const memoryDB: Map<string, MemoryRecord> = new Map();

export function saveMemory(record: MemoryRecord) {
  memoryDB.set(record.id, record);
  return record;
}

export function getMemory(id: string) {
  return memoryDB.get(id);
}

export function getUserMemory(userId: string) {
  return Array.from(memoryDB.values()).filter(m => m.userId === userId);
}

export function getSessionMemory(sessionId: string) {
  return Array.from(memoryDB.values()).filter(m => m.sessionId === sessionId);
}

export function deleteMemory(id: string) {
  return memoryDB.delete(id);
}
