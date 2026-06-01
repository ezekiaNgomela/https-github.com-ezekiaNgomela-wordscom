import React, { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { generateAIResponse } from "../../lib/ai/client";

export default function TipTapEditor() {
  const [loading, setLoading] = useState(false);

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

  const getSelectedText = () => {
    const { from, to } = editor.state.selection;
    return editor.state.doc.textBetween(from, to);
  };

  const replaceSelectionWithAI = async () => {
    const selectedText = getSelectedText();
    if (!selectedText) return;

    setLoading(true);

    const prompt = `Improve and rewrite this text professionally:\n\n${selectedText}`;

    const result = await generateAIResponse(prompt);

    editor.chain().focus().deleteSelection().insertContent(result).run();

    setLoading(false);
  };

  const summarizeSelection = async () => {
    const selectedText = getSelectedText();
    if (!selectedText) return;

    setLoading(true);

    const prompt = `Summarize this text:\n\n${selectedText}`;

    const result = await generateAIResponse(prompt);

    editor.chain().focus().deleteSelection().insertContent(result).run();

    setLoading(false);
  };

  return (
    <div className="h-full w-full border rounded-lg bg-white flex flex-col">
      {/* AI Toolbar */}
      <div className="h-10 border-b flex items-center gap-2 px-3 text-sm">
        <button
          onClick={replaceSelectionWithAI}
          disabled={loading}
          className="px-2 py-1 border rounded"
        >
          Rewrite
        </button>
        <button
          onClick={summarizeSelection}
          disabled={loading}
          className="px-2 py-1 border rounded"
        >
          Summarize
        </button>
        {loading && <span className="text-gray-400">Processing AI...</span>}
      </div>

      {/* Editor */}
      <div className="flex-1">
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  );
}
