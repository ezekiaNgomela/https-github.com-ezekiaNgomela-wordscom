import { getSession } from "./sessionStore";
import { getSessionMemory, getUserMemory } from "./memoryStore";

export function loadMemoryContext(sessionId: string, userId?: string) {
  const session = getSession(sessionId);
  const sessionMemory = getSessionMemory(sessionId);
  const userMemory = userId ? getUserMemory(userId) : [];

  return {
    session,
    sessionMemory,
    userMemory,
    summary: {
      hasSession: !!session,
      sessionSteps: session?.stepResults?.length || 0,
      userRecords: userMemory.length
    }
  };
}