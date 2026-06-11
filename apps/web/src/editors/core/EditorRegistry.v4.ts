import type { EditorType, EditorComponent } from "./EditorTypes";

import RichDocumentEditorV4 from "../document/RichDocumentEditor.v4";
import SpreadsheetEditor from "../spreadsheet/SpreadsheetEditor";
import PresentationEditor from "../presentation/PresentationEditor";
import PDFEditor from "../pdf/PDFEditor";

/**
 * EditorRegistry v4 (COLLAB READY)
 */
export const EditorRegistry: Record<EditorType, EditorComponent> = {
  doc: RichDocumentEditorV4,
  sheet: SpreadsheetEditor,
  ppt: PresentationEditor,
  pdf: PDFEditor,
};