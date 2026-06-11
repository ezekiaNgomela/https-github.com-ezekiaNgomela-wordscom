import { useEffect, useRef } from "react";

/**
 * useAutosave
 * Lightweight autosave system (localStorage-based)
 *
 * Future upgrade point:
 * - backend API sync
 * - conflict resolution
 * - CRDT collaboration
 */

type AutosaveOptions<T> = {
  documentId?: string;
  data: T;
  delay?: number;
  onSave?: (data: T) => void;
};

export function useAutosave<T>({
  documentId,
  data,
  delay = 800,
  onSave,
}: AutosaveOptions<T>) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!documentId) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      try {
        const key = `doc:${documentId}`;
        localStorage.setItem(key, JSON.stringify(data));
        onSave?.(data);
      } catch (err) {
        console.error("Autosave failed:", err);
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, documentId, delay]);
}