// Phase 9 Core Layer - Auth + Workspace System
// Safety-first additive architecture (identity + workspace binding layer)
// Does NOT modify existing auth/Firebase systems; acts as orchestration layer

export type UserRole = "owner" | "admin" | "editor" | "viewer";

export interface UserIdentity {
  userId: string;
  email?: string;
  displayName?: string;
}

export interface WorkspaceMember {
  userId: string;
  role: UserRole;
  joinedAt: number;
}

export interface WorkspaceAccess {
  workspaceId: string;
  members: WorkspaceMember[];
}

export interface AuthState {
  currentUser?: UserIdentity;
  activeWorkspaceId?: string;
  isAuthenticated: boolean;
}

export interface AuthAdapter {
  getCurrentUser: () => Promise<UserIdentity | null>;
  signIn?: (provider: string) => Promise<UserIdentity>;
  signOut?: () => Promise<void>;
}

export class AuthWorkspaceManager {
  private state: AuthState = {
    isAuthenticated: false,
  };

  constructor(private adapter?: AuthAdapter) {}

  async initialize(): Promise<UserIdentity | null> {
    if (!this.adapter) return null;

    const user = await this.adapter.getCurrentUser();

    this.state.currentUser = user || undefined;
    this.state.isAuthenticated = !!user;

    return user;
  }

  async signIn(provider: string): Promise<UserIdentity | null> {
    if (!this.adapter?.signIn) return null;

    const user = await this.adapter.signIn(provider);

    this.state.currentUser = user;
    this.state.isAuthenticated = true;

    return user;
  }

  async signOut(): Promise<void> {
    if (!this.adapter?.signOut) return;

    await this.adapter.signOut();

    this.state.currentUser = undefined;
    this.state.activeWorkspaceId = undefined;
    this.state.isAuthenticated = false;
  }

  setActiveWorkspace(workspaceId: string) {
    this.state.activeWorkspaceId = workspaceId;
  }

  getActiveWorkspace(): string | undefined {
    return this.state.activeWorkspaceId;
  }

  getCurrentUser(): UserIdentity | undefined {
    return this.state.currentUser;
  }

  isAuthenticated(): boolean {
    return this.state.isAuthenticated;
  }

  createWorkspaceAccess(workspaceId: string, owner: UserIdentity): WorkspaceAccess {
    return {
      workspaceId,
      members: [
        {
          userId: owner.userId,
          role: "owner",
          joinedAt: Date.now(),
        },
      ],
    };
  }

  addMember(access: WorkspaceAccess, userId: string, role: UserRole = "editor") {
    const exists = access.members.find(m => m.userId === userId);
    if (exists) return access;

    access.members.push({
      userId,
      role,
      joinedAt: Date.now(),
    });

    return access;
  }

  removeMember(access: WorkspaceAccess, userId: string) {
    access.members = access.members.filter(m => m.userId !== userId);
    return access;
  }

  getUserRole(access: WorkspaceAccess, userId: string): UserRole | null {
    return access.members.find(m => m.userId === userId)?.role || null;
  }
}
