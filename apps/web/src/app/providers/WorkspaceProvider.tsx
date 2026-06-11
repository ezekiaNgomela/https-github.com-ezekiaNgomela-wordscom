import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";

/**
 * Workspace Provider
 * Handles multi-tenant workspace state + loading
 */

type Workspace = {
  id: string;
  name: string;
};

const WorkspaceContext = createContext<any>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);

  const fetchWorkspaces = async () => {
    if (!token) return;

    const res = await fetch("http://localhost:4000/api/workspaces/list", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    const mapped = data.map((w: any) => w.workspace);

    setWorkspaces(mapped);

    if (!activeWorkspace && mapped.length > 0) {
      setActiveWorkspace(mapped[0]);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, [token]);

  const createWorkspace = async (name: string) => {
    if (!token) return;

    const res = await fetch("http://localhost:4000/api/workspaces/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    });

    const data = await res.json();

    await fetchWorkspaces();
    return data;
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        setActiveWorkspace,
        createWorkspace,
        refresh: fetchWorkspaces,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  return useContext(WorkspaceContext);
}