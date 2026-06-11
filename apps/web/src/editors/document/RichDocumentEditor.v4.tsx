import React, { useEffect, useRef, useState } from "react";
import { BaseEditor } from "../core/BaseEditor";
import type { BaseEditorProps } from "../core/EditorTypes";
import { useAutosave } from "../core/useAutosave";
import { saveDocument } from "../../backend/documentApi";
import { useCollaboration } from "../core/useCollaboration";

/**
 * RichDocumentEditor v4 (COLLAB FINAL)
 * - autosave
 * - backend persistence
 * - realtime collaboration
 */

type DocState = {
  id: string;
  content: string;
};

export default function RichDocumentEditorV4({ documentId }: BaseEditorProps) {
  return (
    <BaseEditor<DocState> documentId={documentId}>
      {(state) => {
        const [content, setContent] = useState(state.data?.content || "");
        const editorRef = useRef<HTMLDivElement | null>(null);

        const { remoteContent, sendChange, sendCursor } = useCollaboration({
          documentId,
        });

        useEffect(() => {
          if (state.data?.content) {
            setContent(state.data.content);
          }
        }, [state.data]);

        useEffect(() => {
          if (remoteContent && remoteContent !== content) {
            setContent(remoteContent);
          }
        }, [remoteContent]);

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
            <h1 className="text-lg font-semibold mb-3">
              Rich Document Editor v4 (Collab)
            </h1>

            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              className="border bg-white p-4 min-h-[300px] outline-none"
              onInput={(e) => {
                const value = (e.target as HTMLDivElement).innerText;
                setContent(value);
                sendChange(value);
              }}
              onKeyUp={() => {
                sendCursor({ position: "unknown" });
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
