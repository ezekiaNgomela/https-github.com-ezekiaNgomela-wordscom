import React, { useEffect, useState } from "react";
import type { BaseEditorProps } from "./EditorTypes";

/**
 * BaseEditor
 * Shared abstraction layer for all editors.
 * Handles document lifecycle, loading state, and basic contract.
 */

export interface EditorState<T = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useEditorState<T>(documentId?: string) {
  const [state, setState] = useState<EditorState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!documentId) {
      setState({ data: null, loading: false, error: "No documentId provided" });
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        setState((s) => ({ ...s, loading: true }));

        // Placeholder: replace with real API/data layer
        const fakeData = await new Promise((res) =>
          setTimeout(() => res({ id: documentId }), 300)
        );

        if (!cancelled) {
          setState({ data: fakeData, loading: false, error: null });
        }
      } catch (e: any) {
        if (!cancelled) {
          setState({ data: null, loading: false, error: e?.message || "Error" });
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [documentId]);

  return state;
}

/**
 * BaseEditor wrapper component
 * Ensures consistent loading + error handling across all editors
 */
export function BaseEditor<T>({
  documentId,
  children,
}: BaseEditorProps & {
  children: (state: EditorState<T>) => React.ReactNode;
}) {
  const state = useEditorState<T>(documentId);

  if (state.loading) {
    return <div className="p-4">Loading editor...</div>;
  }

  if (state.error) {
    return <div className="p-4 text-red-500">Error: {state.error}</div>;
  }

  return <>{children(state)}</>;
}
