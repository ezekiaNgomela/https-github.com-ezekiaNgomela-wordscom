// Phase 34.5 - UI Polish Layer (Editor Toolbar)
// Adds Notion-style top toolbar with AI + formatting actions

import React from "react";

export function EditorToolbar({
  onAI,
  onSlash,
  onBold,
  onHeading,
}: {
  onAI?: () => void;
  onSlash?: () => void;
  onBold?: () => void;
  onHeading?: () => void;
}) {
  return (
    <div className="sticky top-0 z-50 flex items-center justify-between px-4 py-2 border-b bg-white/80 backdrop-blur">
      {/* Left side: formatting */}
      <div className="flex items-center gap-2">
        <button
          onClick={onBold}
          className="px-2 py-1 rounded hover:bg-gray-200 text-sm"
        >
          B
        </button>

        <button
          onClick={onHeading}
          className="px-2 py-1 rounded hover:bg-gray-200 text-sm"
        >
          H
        </button>

        <button
          onClick={onSlash}
          className="px-2 py-1 rounded hover:bg-gray-200 text-sm"
        >
          /
        </button>
      </div>

      {/* Center title (future doc name placeholder) */}
      <div className="text-sm font-medium opacity-70">
        WordCom Editor
      </div>

      {/* Right side: AI actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onAI}
          className="px-3 py-1 rounded bg-black text-white text-sm hover:opacity-80"
        >
          AI Assist
        </button>
      </div>
    </div>
  );
}
