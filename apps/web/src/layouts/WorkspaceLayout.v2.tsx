import React from "react";
import FileExplorer from "../components/workspace/FileExplorer";

/**
 * WorkspaceLayout v2
 * Product UI shell for document system
 */

export default function WorkspaceLayoutV2({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <FileExplorer />

      <div className="flex-1 bg-white">
        {children}
      </div>
    </div>
  );
}