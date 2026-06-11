import type { EditorType, EditorComponent } from "./EditorTypes";
import { EditorRegistry } from "./EditorRegistry.v2";

/**
 * EditorEngine (v2)
 * Migrated resolver using registry v2
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