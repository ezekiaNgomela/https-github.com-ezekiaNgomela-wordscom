import React from "react";
import { useWorkspaceStore } from "../../store/workspace.store";

/**
 * FileExplorer
 * Minimal workspace navigator (MVP)
 */

export default function FileExplorer() {
  const { documents } = useWorkspaceStore();

  return (
    <div className="p-3 border-r w-64 bg-gray-50">
      <h2 className="font-semibold mb-3">Workspace</h2>

      <div className="space-y-2">
        {documents?.length ? (
          documents.map((doc: any) => (
            <div
              key={doc.id}
              className="p-2 bg-white border rounded cursor-pointer hover:bg-gray-100"
            >
              Document {doc.id}
            </div>
          ))
        ) : (
          <div className="text-sm text-gray-500">No documents yet</div>
        )}
      </div>
    </div>
  );
}