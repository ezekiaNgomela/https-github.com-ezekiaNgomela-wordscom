import type { EditorType, EditorComponent } from "./EditorTypes";
import { EditorRegistry } from "./EditorRegistry";

/**
 * EditorEngine
 * Central resolver that selects and returns the correct editor
 * based on document type.
 */
export class EditorEngine {
  /**
   * Resolve an editor component from the registry.
   */
  static resolve(type: EditorType): EditorComponent {
    const editor = EditorRegistry[type];

    if (!editor) {
      return () => <div>Unknown editor type: {type}</div>;
    }

    return editor;
  }

  /**
   * Convenience method to render an editor directly.
   */
  static render(type: EditorType, documentId?: string) {
    const Editor = this.resolve(type);
    return <Editor documentId={documentId} />;
  }
}
