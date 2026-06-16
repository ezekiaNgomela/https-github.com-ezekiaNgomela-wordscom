import { EditorState } from "../store/editorState";
import { TableNode } from "../types/document";

function findTable(state: EditorState, tableId: string): TableNode | undefined {
  return state.document.nodes.find(
    (n: any) => n.type === "table" && n.id === tableId
  ) as TableNode | undefined;
}

export const TableCommands = {
  toggleStriped(state: EditorState, tableId: string) {
    const table = findTable(state, tableId);
    if (!table) return;

    table.attrs.striped = !table.attrs.striped;
  },

  toggleBoldHeader(state: EditorState, tableId: string) {
    const table = findTable(state, tableId);
    if (!table) return;

    table.attrs.boldHeader = !table.attrs.boldHeader;
  },

  toggleCondensed(state: EditorState, tableId: string) {
    const table = findTable(state, tableId);
    if (!table) return;

    table.attrs.condensed = !table.attrs.condensed;
  },
};
