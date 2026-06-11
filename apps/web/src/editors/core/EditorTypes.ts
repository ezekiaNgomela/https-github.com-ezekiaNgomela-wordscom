export type EditorType = "doc" | "sheet" | "ppt" | "pdf";

export interface BaseEditorProps {
  documentId?: string;
}

export interface EditorComponent {
  (props: BaseEditorProps): JSX.Element;
}
