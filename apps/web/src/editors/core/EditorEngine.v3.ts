import type { EditorType, EditorComponent } from "./EditorTypes";
import { EditorRegistry } from "./EditorRegistry.v3";

/**
 * EditorEngine v3
 * Fully upgraded engine using Rich Registry
 */
export class EditorEngine {
  static resolve(type: EditorType): EditorComponent {
    const editor = EditorRegistry[type];

    if (!editor) {
      return () => <div>Unknown editor type: {type}</div>;
    }

    return editor;
  }

  static render(type: EditorType, documentId?: string) {
    const Editor = this.resolve(type);
    return <Editor documentId={documentId} />;
  }
}