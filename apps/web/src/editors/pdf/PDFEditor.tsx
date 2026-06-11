import React from "react";
import { BaseEditor } from "../core/BaseEditor";
import type { BaseEditorProps } from "../core/EditorTypes";

/**
 * PDFEditor
 * Minimal viewer foundation (future: annotations + rendering engine)
 */

export default function PDFEditor({ documentId }: BaseEditorProps) {
  return (
    <BaseEditor<{ id: string }> documentId={documentId}>
      {(state) => {
        return (
          <div className="p-4">
            <h1 className="text-lg font-semibold mb-2">PDF Editor</h1>
            <div className="text-sm text-gray-600 mb-4">
              Document ID: {state.data?.id}
            </div>

            <div className="border bg-gray-100 p-6 text-center">
              PDF Viewer Placeholder
            </div>
          </div>
        );
      }}
    </BaseEditor>
  );
}
