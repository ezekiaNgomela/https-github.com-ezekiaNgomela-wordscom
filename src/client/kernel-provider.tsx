// Phase 17 - Frontend Integration Layer
// React provider that binds UI to SystemKernel runtime
// Enables UI components to access AI, Sync, Events, and Workspace state

import React, { createContext, useContext, useEffect, useState } from "react";
import { kernel } from "../server/bootstrap/runtime-bootstrap";

// -----------------------------
// TYPES
// -----------------------------

export interface KernelContextValue {
  kernel: typeof kernel;
  ready: boolean;
  status: string;
}

const KernelContext = createContext<KernelContextValue | null>(null);

// -----------------------------
// PROVIDER
// -----------------------------

export function KernelProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState("initializing");

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        setStatus("booting kernel");

        // Kernel is already constructed at import time
        await kernel.initialize();

        if (!mounted) return;

        setReady(true);
        setStatus("ready");
      } catch (err) {
        console.error("Kernel init failed:", err);
        setStatus("error");
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <KernelContext.Provider value={{ kernel, ready, status }}>
      {children}
    </KernelContext.Provider>
  );
}

// -----------------------------
// HOOK
// -----------------------------

export function useKernel() {
  const ctx = useContext(KernelContext);

  if (!ctx) {
    throw new Error("useKernel must be used within KernelProvider");
  }

  return ctx;
}
