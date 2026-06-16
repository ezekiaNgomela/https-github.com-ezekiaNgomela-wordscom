import React from "react";
import { BaseEditor } from "../core/BaseEditor";
import type { BaseEditorProps } from "../core/EditorTypes";

import { TableView } from "../../editor/render/TableView";
import type { TableNode } from "../../editor/types/document";

/**
 * DocumentEditor
 * Schema-driven rendering integrated (incremental migration)
 */
export default function DocumentEditor({ documentId }: BaseEditorProps) {
  return (
    <BaseEditor<{ id: string; nodes?: any[] }> documentId={documentId}>
      {(state) => {
        const document = state.data;

        return (
          <div className="p-4">
            <h1 className="text-lg font-semibold mb-2">
              Document Editor (Schema Mode)
            </h1>

            <div className="text-sm text-gray-600 mb-4">
              Document ID: {document?.id}
            </div>

            <div className="border rounded p-3 bg-white space-y-4">
              {document?.nodes?.length ? (
                document.nodes.map((node: any) => {
                  if (node.type === "table") {
                    return (
                      <TableView
                        key={node.id}
                        node={node as TableNode}
                      />
                    );
                  }

                  if (node.type === "paragraph") {
                    return (
                      <p key={node.id} className="text-sm text-gray-800">
                        {node.content?.map((n: any, i: number) =>
                          n.type === "text" ? (
                            <span key={i}>{n.text}</span>
                          ) : null
                        )}
                      </p>
                    );
                  }

                  return null;
                })
              ) : (
                <textarea
                  className="w-full h-64 outline-none"
                  placeholder="Start writing..."
                  defaultValue=""
                />
              )}
            </div>
          </div>
        );
      }}
    </BaseEditor>
  );
}