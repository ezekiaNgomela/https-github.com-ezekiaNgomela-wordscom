import React from "react";
import TipTapEditor from "../components/editor/TipTapEditor";

export default function Editor() {
  return (
    <div className="h-screen w-full flex flex-col bg-white">
      {/* Top Bar */}
      <div className="h-12 border-b flex items-center px-4 justify-between">
        <div className="font-semibold">WordCom Editor</div>
        <div className="text-sm text-gray-500">AI Workspace</div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-1">
        {/* Editor Area */}
        <div className="flex-1 p-6">
          <TipTapEditor />
        </div>

        {/* AI Panel */}
        <div className="w-80 border-l p-4">
          <div className="font-semibold mb-2">AI Assistant</div>
          <div className="text-sm text-gray-500">
            Ask AI to rewrite, summarize or improve your document.
          </div>
        </div>
      </div>
    </div>
  );
}
