// Phase 28.3 - Auth Middleware (RBAC + Workspace Protection)
// Secures API routes, WebSockets, and workspace access

import { verifyToken } from "./jwt";

export interface AuthContext {
  userId: string;
  workspaceId: string;
  role: "owner" | "editor" | "viewer";
}

// Simulated request type (replace with Express/Fastify type in production)
export interface AuthRequest {
  headers: Record<string, string | undefined>;
  auth?: AuthContext;
}

export function authMiddleware(req: AuthRequest): AuthContext {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    throw new Error("Missing Authorization header");
  }

  const token = authHeader.replace("Bearer ", "");
  const payload = verifyToken(token);

  if (!payload) {
    throw new Error("Invalid or expired token");
  }

  const context: AuthContext = {
    userId: payload.userId,
    workspaceId: payload.workspaceId,
    role: payload.role,
  };

  req.auth = context;

  return context;
}
