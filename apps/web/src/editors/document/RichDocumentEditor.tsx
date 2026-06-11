import React, { useEffect, useRef, useState } from "react";
import { BaseEditor } from "../core/BaseEditor";
import type { BaseEditorProps } from "../core/EditorTypes";
import { useAutosave } from "../core/useAutosave";
import { saveDocument } from "../../backend/documentApi";

/**
 * RichDocumentEditor
 * Minimal ProseMirror-like editor using contentEditable
 * Structured JSON-based document model
 */

type DocState = {
  id: string;
  content: string;
};

export default function RichDocumentEditor({ documentId }: BaseEditorProps) {
  return (
    <BaseEditor<DocState> documentId={documentId}>
      {(state) => {
        const [content, setContent] = useState(state.data?.content || "");
        const editorRef = useRef<HTMLDivElement | null>(null);

        useEffect(() => {
          setContent(state.data?.content || "");
        }, [state.data]);

        useAutosave({
          documentId,
          data: { id: documentId!, content, updatedAt: Date.now() },
          onSave: async (doc) => {
            if (!documentId) return;
            await saveDocument(doc);
          },
        });

        return (
          <div className="p-4">
            <h1 className="text-lg font-semibold mb-3">Rich Document Editor</h1>

            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              className="border bg-white p-4 min-h-[300px] outline-none"
              onInput={(e) => {
                setContent((e.target as HTMLDivElement).innerText);
              }}
            >
              {content}
            </div>
          </div>
        );
      }}
    </BaseEditor>
  );
}
