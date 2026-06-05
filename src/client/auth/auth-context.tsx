// Phase 21.1 - Frontend Auth Integration Layer
// Connects UI → Kernel sessions → AuthService backend abstraction
// Provides login/session/workspace context for WordCom UI

import React, { createContext, useContext, useEffect, useState } from "react";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthSession {
  sessionId: string;
  user: AuthUser;
  workspaceId: string;
  role: "owner" | "admin" | "editor" | "viewer";
}

interface AuthContextType {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  login: (email: string, name?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("wordcom_session");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUser(parsed.user);
        setSession(parsed);
      } catch {}
    }
    setLoading(false);
  }, []);

  async function login(email: string, name?: string) {
    const fakeUser: AuthUser = {
      id: `user_${Date.now()}`,
      email,
      name: name || "User",
    };

    const fakeSession: AuthSession = {
      sessionId: `sess_${Date.now()}`,
      user: fakeUser,
      workspaceId: "default_workspace",
      role: "owner",
    };

    setUser(fakeUser);
    setSession(fakeSession);
    localStorage.setItem("wordcom_session", JSON.stringify(fakeSession));
  }

  function logout() {
    setUser(null);
    setSession(null);
    localStorage.removeItem("wordcom_session");
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
