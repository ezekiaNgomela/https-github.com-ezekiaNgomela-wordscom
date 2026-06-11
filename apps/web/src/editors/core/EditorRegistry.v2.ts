import type { EditorType, EditorComponent } from "./EditorTypes";

import DocumentEditor from "../document/DocumentEditor";
import SpreadsheetEditor from "../spreadsheet/SpreadsheetEditor";
import PresentationEditor from "../presentation/PresentationEditor";
import PDFEditor from "../pdf/PDFEditor";

export const EditorRegistry: Record<EditorType, EditorComponent> = {
  doc: DocumentEditor,
  sheet: SpreadsheetEditor,
  ppt: PresentationEditor,
  pdf: PDFEditor,
};
