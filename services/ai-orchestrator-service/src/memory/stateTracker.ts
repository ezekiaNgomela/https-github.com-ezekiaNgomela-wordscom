import { getSession, updateSession, appendStepResult } from "./sessionStore";
import { saveMemory } from "./memoryStore";

export type WorkflowState = {
  sessionId: string;
  currentStep: number;
  completed: boolean;
  lastError?: string;
};

export function startWorkflow(sessionId: string) {
  const session = getSession(sessionId);
  if (!session) return null;

  updateSession(sessionId, {
    stepIndex: 0,
    stepResults: []
  });

  return { sessionId, currentStep: 0, completed: false };
}

export function recordStep(sessionId: string, result: any) {
  appendStepResult(sessionId, result);

  saveMemory({
    id: `${sessionId}-${Date.now()}`,
    sessionId,
    type: "workflow",
    data: result,
    createdAt: Date.now()
  });
}

export function markComplete(sessionId: string) {
  updateSession(sessionId, {
    metadata: { completed: true }
  });

  saveMemory({
    id: `${sessionId}-complete-${Date.now()}`,
    sessionId,
    type: "workflow",
    data: { status: "completed" },
    createdAt: Date.now()
  });
}
