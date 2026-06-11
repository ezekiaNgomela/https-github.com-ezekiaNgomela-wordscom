import React from "react";
import { BaseEditor } from "../core/BaseEditor";
import type { BaseEditorProps } from "../core/EditorTypes";

/**
 * PresentationEditor
 * Slide-based editor foundation
 */

export default function PresentationEditor({ documentId }: BaseEditorProps) {
  return (
    <BaseEditor<{ id: string }> documentId={documentId}>
      {(state) => {
        return (
          <div className="p-4">
            <h1 className="text-lg font-semibold mb-2">Presentation Editor</h1>
            <div className="text-sm text-gray-600 mb-4">
              Document ID: {state.data?.id}
            </div>

            <div className="border bg-white p-6">
              <div className="border p-6 text-center">
                Slide 1
              </div>
            </div>
          </div>
        );
      }}
    </BaseEditor>
  );
}
