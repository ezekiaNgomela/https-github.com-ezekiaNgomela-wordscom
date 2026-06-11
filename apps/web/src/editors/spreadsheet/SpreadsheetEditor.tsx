import React from "react";
import { BaseEditor } from "../core/BaseEditor";
import type { BaseEditorProps } from "../core/EditorTypes";

/**
 * SpreadsheetEditor
 * Minimal grid foundation (future: full calc engine)
 */

export default function SpreadsheetEditor({ documentId }: BaseEditorProps) {
  return (
    <BaseEditor<{ id: string }> documentId={documentId}>
      {(state) => {
        return (
          <div className="p-4">
            <h1 className="text-lg font-semibold mb-2">Spreadsheet Editor</h1>
            <div className="text-sm text-gray-600 mb-4">
              Document ID: {state.data?.id}
            </div>

            <div className="border bg-white p-3">
              <table className="w-full border-collapse">
                <tbody>
                  {Array.from({ length: 10 }).map((_, row) => (
                    <tr key={row}>
                      {Array.from({ length: 5 }).map((_, col) => (
                        <td key={col} className="border p-2">
                          <input
                            className="w-full outline-none"
                            placeholder={`${String.fromCharCode(65 + col)}${row + 1}`}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      }}
    </BaseEditor>
  );
}
