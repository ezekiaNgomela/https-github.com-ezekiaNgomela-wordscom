export type SessionState = {
  sessionId: string;
  userId?: string;
  createdAt: number;
  updatedAt: number;
  currentPlan?: any;
  stepIndex: number;
  stepResults: any[];
  metadata?: Record<string, any>;
};

const sessions: Map<string, SessionState> = new Map();

export function createSession(sessionId: string, userId?: string): SessionState {
  const session: SessionState = {
    sessionId,
    userId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    stepIndex: 0,
    stepResults: []
  };

  sessions.set(sessionId, session);
  return session;
}

export function getSession(sessionId: string): SessionState | undefined {
  return sessions.get(sessionId);
}

export function updateSession(sessionId: string, patch: Partial<SessionState>) {
  const existing = sessions.get(sessionId);
  if (!existing) return undefined;

  const updated = {
    ...existing,
    ...patch,
    updatedAt: Date.now()
  };

  sessions.set(sessionId, updated);
  return updated;
}

export function appendStepResult(sessionId: string, result: any) {
  const session = sessions.get(sessionId);
  if (!session) return;

  session.stepResults.push(result);
  session.stepIndex += 1;
  session.updatedAt = Date.now();

  sessions.set(sessionId, session);
}
