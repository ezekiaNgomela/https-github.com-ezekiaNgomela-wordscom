import React from "react";

export function EditorSelectionOverlay({
  active,
  rect,
  onAI,
  onDelete,
}: {
  active: boolean;
  rect?: DOMRect | null;
  onAI?: () => void;
  onDelete?: () => void;
}) {
  if (!active || !rect) return null;

  return (
    <div
      className="absolute z-50"
      style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
    >
      <div className="absolute inset-0 bg-blue-100/40 rounded" />

      <div className="absolute -left-10 top-0 flex flex-col gap-1">
        <button onClick={onAI} className="text-xs px-2 py-1 bg-black text-white rounded">
          AI
        </button>
        <button onClick={onDelete} className="text-xs px-2 py-1 bg-red-500 text-white rounded">
          Del
        </button>
      </div>
    </div>
  );
}
