import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export default function TipTapEditor() {
  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p>Start writing your document...</p>",
    editorProps: {
      attributes: {
        class:
          "h-full w-full p-6 outline-none text-gray-800 prose max-w-none",
      },
    },
  });

  if (!editor) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        Loading editor...
      </div>
    );
  }

  return (
    <div className="h-full w-full border rounded-lg bg-white">
      <EditorContent editor={editor} className="h-full" />
    </div>
  );
}
