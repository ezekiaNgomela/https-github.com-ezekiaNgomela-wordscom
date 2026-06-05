// Phase 23.1 - Production Hardening: WebSocket Security Guard
// Implements rate limiting + workspace isolation enforcement
// Prevents abuse and cross-workspace data leakage

import { AuthTokenPayload } from "../auth/jwt-middleware";

interface ConnectionRecord {
  userId: string;
  workspaceId: string;
  lastMessageTime: number;
  messageCountWindow: number;
}

const RATE_LIMIT_WINDOW_MS = 10_000; // 10s window
const MAX_MESSAGES_PER_WINDOW = 50;

const connections = new Map<string, ConnectionRecord>();

function key(userId: string, workspaceId: string) {
  return `${userId}:${workspaceId}`;
}

export function validateWsConnection(
  user: AuthTokenPayload,
  workspaceId: string
): boolean {
  if (user.workspaceId !== workspaceId) {
    return false;
  }

  const k = key(user.userId, workspaceId);
  const now = Date.now();

  let record = connections.get(k);

  if (!record) {
    record = {
      userId: user.userId,
      workspaceId,
      lastMessageTime: now,
      messageCountWindow: 0,
    };
    connections.set(k, record);
  }

  if (now - record.lastMessageTime > RATE_LIMIT_WINDOW_MS) {
    record.messageCountWindow = 0;
    record.lastMessageTime = now;
  }

  record.messageCountWindow++;

  if (record.messageCountWindow > MAX_MESSAGES_PER_WINDOW) {
    return false;
  }

  return true;
}

export function cleanupWsSecurity() {
  const now = Date.now();

  for (const [k, v] of connections.entries()) {
    if (now - v.lastMessageTime > 60_000) {
      connections.delete(k);
    }
  }
}
