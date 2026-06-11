import type { EditorType, EditorComponent } from "./EditorTypes";

// NOTE: These imports will be implemented in subsequent steps
// For now we define placeholders to establish the registry structure

const DocumentEditor: EditorComponent = ({ documentId }) => {
  return <div>Document Editor - {documentId}</div>;
};

const SpreadsheetEditor: EditorComponent = ({ documentId }) => {
  return <div>Spreadsheet Editor - {documentId}</div>;
};

const PresentationEditor: EditorComponent = ({ documentId }) => {
  return <div>Presentation Editor - {documentId}</div>;
};

const PDFEditor: EditorComponent = ({ documentId }) => {
  return <div>PDF Editor - {documentId}</div>;
};

export const EditorRegistry: Record<EditorType, EditorComponent> = {
  doc: DocumentEditor,
  sheet: SpreadsheetEditor,
  ppt: PresentationEditor,
  pdf: PDFEditor,
};
