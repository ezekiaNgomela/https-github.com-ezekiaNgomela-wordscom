import type { EditorType, EditorComponent } from "./EditorTypes";

import RichDocumentEditor from "../document/RichDocumentEditor";
import SpreadsheetEditor from "../spreadsheet/SpreadsheetEditor";
import PresentationEditor from "../presentation/PresentationEditor";
import PDFEditor from "../pdf/PDFEditor";

/**
 * FINAL RICH REGISTRY (v3)
 * doc now uses RichDocumentEditor
 */
export const EditorRegistry: Record<EditorType, EditorComponent> = {
  doc: RichDocumentEditor,
  sheet: SpreadsheetEditor,
  ppt: PresentationEditor,
  pdf: PDFEditor,
};