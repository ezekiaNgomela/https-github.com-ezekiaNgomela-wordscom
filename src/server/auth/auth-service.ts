// Phase 19 - Authentication Core Service
// Foundation for multi-user workspace, permissions, and ownership
// Lightweight abstraction (can later plug OAuth, JWT, sessions, DB)

export type UserRole = "owner" | "admin" | "editor" | "viewer";

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: number;
}

export interface Session {
  id: string;
  userId: string;
  workspaceId: string;
  role: UserRole;
  expiresAt: number;
}

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  createdAt: number;
}

export class AuthService {
  private users = new Map<string, User>();
  private sessions = new Map<string, Session>();
  private workspaces = new Map<string, Workspace>();

  // -----------------------------
  // USER MANAGEMENT
  // -----------------------------

  createUser(email: string, name: string): User {
    const user: User = {
      id: `user_${Date.now()}`,
      email,
      name,
      createdAt: Date.now(),
    };

    this.users.set(user.id, user);
    return user;
  }

  getUser(userId: string): User | undefined {
    return this.users.get(userId);
  }

  // -----------------------------
  // WORKSPACE MANAGEMENT
  // -----------------------------

  createWorkspace(name: string, ownerId: string): Workspace {
    const workspace: Workspace = {
      id: `ws_${Date.now()}`,
      name,
      ownerId,
      createdAt: Date.now(),
    };

    this.workspaces.set(workspace.id, workspace);
    return workspace;
  }

  getWorkspace(workspaceId: string): Workspace | undefined {
    return this.workspaces.get(workspaceId);
  }

  // -----------------------------
  // SESSION MANAGEMENT
  // -----------------------------

  createSession(userId: string, workspaceId: string, role: UserRole = "editor"): Session {
    const session: Session = {
      id: `sess_${Date.now()}`,
      userId,
      workspaceId,
      role,
      expiresAt: Date.now() + 1000 * 60 * 60 * 24, // 24h
    };

    this.sessions.set(session.id, session);
    return session;
  }

  validateSession(sessionId: string): Session | null {
    const session = this.sessions.get(sessionId);

    if (!session) return null;
    if (session.expiresAt < Date.now()) return null;

    return session;
  }

  // -----------------------------
  // PERMISSIONS
  // -----------------------------

  canEdit(session: Session): boolean {
    return session.role === "owner" || session.role === "admin" || session.role === "editor";
  }

  canAdmin(session: Session): boolean {
    return session.role === "owner" || session.role === "admin";
  }

  canView(session: Session): boolean {
    return true;
  }
}
