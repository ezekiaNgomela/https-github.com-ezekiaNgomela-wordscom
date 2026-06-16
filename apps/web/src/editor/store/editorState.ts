import { Document } from "../types/document";

export type EditorState = {
  document: Document;
  activeTableId: string | null;
  activeCellId: string | null;
};

export function createInitialState(): EditorState {
  return {
    document: {
      id: "doc-1",
      nodes: [],
    },
    activeTableId: null,
    activeCellId: null,
  };
}
