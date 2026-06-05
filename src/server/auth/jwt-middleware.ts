// Phase 23.0 - Production Hardening: JWT Auth Middleware
// Secures API + WebSocket handshake with token verification

import crypto from "crypto";

const SECRET = process.env.JWT_SECRET || "dev_secret";

export interface AuthTokenPayload {
  userId: string;
  workspaceId: string;
  role: "owner" | "admin" | "editor" | "viewer";
  exp: number;
}

function base64url(input: string) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function decodeBase64url(input: string) {
  input = input.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(input, "base64").toString();
}

export function signToken(payload: Omit<AuthTokenPayload, "exp">, ttlSeconds = 60 * 60 * 24) {
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));

  const fullPayload: AuthTokenPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };

  const payloadEncoded = base64url(JSON.stringify(fullPayload));
  const data = `${header}.${payloadEncoded}`;

  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(data)
    .digest("base64url");

  return `${data}.${signature}`;
}

export function verifyToken(token: string): AuthTokenPayload | null {
  try {
    const [header, payload, signature] = token.split(".");
    if (!header || !payload || !signature) return null;

    const data = `${header}.${payload}`;

    const expectedSig = crypto
      .createHmac("sha256", SECRET)
      .update(data)
      .digest("base64url");

    if (expectedSig !== signature) return null;

    const decoded: AuthTokenPayload = JSON.parse(decodeBase64url(payload));

    if (decoded.exp < Math.floor(Date.now() / 1000)) return null;

    return decoded;
  } catch {
    return null;
  }
}

export function authenticateSocket(req: any): AuthTokenPayload | null {
  const token = req?.headers?.authorization?.replace("Bearer ", "");
  if (!token) return null;
  return verifyToken(token);
}
