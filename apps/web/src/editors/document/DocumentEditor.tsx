import React from "react";
import { BaseEditor } from "../core/BaseEditor";
import type { BaseEditorProps } from "../core/EditorTypes";

/**
 * DocumentEditor
 * Rich text document editor (foundation layer)
 */

export default function DocumentEditor({ documentId }: BaseEditorProps) {
  return (
    <BaseEditor<{ id: string }> documentId={documentId}>
      {(state) => {
        return (
          <div className="p-4">
            <h1 className="text-lg font-semibold mb-2">Document Editor</h1>
            <div className="text-sm text-gray-600 mb-4">
              Document ID: {state.data?.id}
            </div>
            <div className="border rounded p-3 bg-white">
              <textarea
                className="w-full h-64 outline-none"
                placeholder="Start writing..."
                defaultValue={""}
              />
            </div>
          </div>
        );
      }}
    </BaseEditor>
  );
}
