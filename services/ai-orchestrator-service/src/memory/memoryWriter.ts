import { saveMemory } from "./memoryStore";
import { updateSession } from "./sessionStore";

export function writeToolResult(sessionId: string, tool: string, result: any) {
  const record = {
    id: `${sessionId}-${tool}-${Date.now()}`,
    sessionId,
    type: "tool_result" as const,
    data: { tool, result },
    createdAt: Date.now()
  };

  saveMemory(record);

  updateSession(sessionId, {
    stepResults: [{ tool, result }]
  });

  return record;
}

export function writeWorkflowNote(sessionId: string, note: string) {
  const record = {
    id: `${sessionId}-note-${Date.now()}`,
    sessionId,
    type: "note" as const,
    data: { note },
    createdAt: Date.now()
  };

  saveMemory(record);
  return record;
}
