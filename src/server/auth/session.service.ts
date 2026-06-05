// Phase 32.3 - Refresh Token System (Sessions + Device Tracking + Rotation)
// Production-grade session management replacing in-memory token store

import crypto from "crypto";
import { DBClient } from "../db/client";

export interface Session {
  id: string;
  userId: string;

  refreshTokenHash: string;

  deviceId: string;
  userAgent?: string;
  ip?: string;

  createdAt: number;
  updatedAt: number;
  expiresAt: number;

  revoked: boolean;
}

const SESSION_TABLE = "sessions";
const ACCESS_TTL = 15 * 60 * 1000; // 15 min
const REFRESH_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

export class SessionService {
  private static db() {
    return DBClient.get<Session>(SESSION_TABLE);
  }

  // CREATE SESSION (LOGIN)
  static async createSession(input: {
    userId: string;
    deviceId: string;
    userAgent?: string;
    ip?: string;
  }) {
    const refreshToken = generateToken();
    const sessionId = crypto.randomUUID();

    const now = Date.now();

    const session: Session = {
      id: sessionId,
      userId: input.userId,
      refreshTokenHash: hashToken(refreshToken),

      deviceId: input.deviceId,
      userAgent: input.userAgent,
      ip: input.ip,

      createdAt: now,
      updatedAt: now,
      expiresAt: now + REFRESH_TTL,

      revoked: false,
    };

    await this.db().create(session);

    return {
      session,
      refreshToken
    };
  }

  // VERIFY REFRESH TOKEN
  static async verifyRefreshToken(sessionId: string, token: string) {
    const session = await this.db().get(sessionId);
    if (!session) throw new Error("Session not found");

    if (session.revoked) throw new Error("Session revoked");

    if (Date.now() > session.expiresAt) {
      throw new Error("Session expired");
    }

    const hashed = hashToken(token);

    if (hashed !== session.refreshTokenHash) {
      throw new Error("Invalid refresh token");
    }

    return session;
  }

  // ROTATE REFRESH TOKEN
  static async rotate(sessionId: string, oldToken: string) {
    const session = await this.verifyRefreshToken(sessionId, oldToken);

    const newRefreshToken = generateToken();

    const updated: Session = {
      ...session,
      refreshTokenHash: hashToken(newRefreshToken),
      updatedAt: Date.now(),
    };

    await this.db().update(sessionId, updated);

    return {
      session: updated,
      refreshToken: newRefreshToken
    };
  }

  // REVOKE SESSION
  static async revoke(sessionId: string) {
    const session = await this.db().get(sessionId);
    if (!session) return;

    await this.db().update(sessionId, {
      ...session,
      revoked: true,
      updatedAt: Date.now(),
    });
  }

  // REVOKE ALL USER SESSIONS
  static async revokeAll(userId: string) {
    const sessions = await this.db().list();

    for (const s of sessions) {
      if (s.userId === userId) {
        await this.db().update(s.id, {
          ...s,
          revoked: true,
          updatedAt: Date.now(),
        });
      }
    }
  }

  // LIST USER SESSIONS
  static async list(userId: string) {
    const sessions = await this.db().list();
    return sessions.filter((s) => s.userId === userId);
  }

  // ACCESS TOKEN TTL INFO
  static getAccessTokenTTL() {
    return ACCESS_TTL;
  }
}
