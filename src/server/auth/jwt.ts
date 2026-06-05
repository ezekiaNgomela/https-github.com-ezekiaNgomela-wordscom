// Phase 27.0 - Authentication System Core (JWT Layer)
// Provides token signing + verification for WordCom workspace security

import crypto from "crypto";

export interface AuthTokenPayload {
  userId: string;
  workspaceId: string;
  role: "owner" | "editor" | "viewer";
  exp: number;
}

const SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

function base64url(input: string) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function sign(data: string) {
  return crypto
    .createHmac("sha256", SECRET)
    .update(data)
    .digest("base64url");
}

export function createToken(payload: Omit<AuthTokenPayload, "exp">, ttlSec = 60 * 60 * 24) {
  const fullPayload: AuthTokenPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + ttlSec,
  };

  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64url(JSON.stringify(fullPayload));

  const signature = sign(`${header}.${body}`);

  return `${header}.${body}.${signature}`;
}

export function verifyToken(token: string): AuthTokenPayload | null {
  try {
    const [header, body, signature] = token.split(".");

    if (!header || !body || !signature) return null;

    const expected = sign(`${header}.${body}`);
    if (expected !== signature) return null;

    const payload = JSON.parse(Buffer.from(body, "base64").toString());

    if (payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch {
    return null;
  }
}
