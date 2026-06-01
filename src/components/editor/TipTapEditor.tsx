import React, { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { generateAIResponse } from "../../lib/ai/client";

export default function TipTapEditor() {
  const [loading, setLoading] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p>Start writing your document...</p>",
    editorProps: {
      attributes: {
        class:
          "h-full w-full p-6 outline-none text-gray-800 prose max-w-none",
      },
      handleKeyDown: (view, event) => {
        if (event.key === "/") setCommandOpen(true);
        if (event.key === "Escape") setCommandOpen(false);
        return false;
      },
    },
  });

  const getSelectedText = () => {
    if (!editor) return "";
    const { from, to } = editor.state.selection;
    return editor.state.doc.textBetween(from, to);
  };

  const getFullDocument = () => {
    if (!editor) return "";
    return editor.getText();
  };

  const buildPrompt = (instruction: string, selectedText: string) => {
    const doc = getFullDocument();

    return `You are WordCom AI, an advanced writing assistant.

FULL DOCUMENT CONTEXT:
${doc}

INSTRUCTION:
${instruction}

SELECTED TEXT:
${selectedText || "(none)"}

Return only the improved text without explanation.`;
  };

  const runAI = async (instruction: string) => {
    const selectedText = getSelectedText();

    setLoading(true);

    const prompt = buildPrompt(instruction, selectedText);

    const result = await generateAIResponse(prompt);

    if (selectedText) {
      editor.chain().focus().deleteSelection().insertContent(result).run();
    } else {
      editor.chain().focus().insertContent(result).run();
    }

    setLoading(false);
    setCommandOpen(false);
  };

  if (!editor) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        Loading editor...
      </div>
    );
  }

  return (
    <div className="h-full w-full border rounded-lg bg-white flex flex-col relative">
      <div className="h-10 border-b flex items-center gap-2 px-3 text-sm">
        <button onClick={() => runAI("Rewrite professionally")} disabled={loading} className="px-2 py-1 border rounded">
          Rewrite
        </button>
        <button onClick={() => runAI("Summarize document")} disabled={loading} className="px-2 py-1 border rounded">
          Summarize
        </button>
        {loading && <span className="text-gray-400">AI thinking...</span>}
      </div>

      {commandOpen && (
        <div className="absolute top-12 left-4 bg-white border rounded shadow p-2 text-sm z-50">
          <div className="font-semibold mb-2">AI Commands</div>
          <button className="block w-full text-left px-2 py-1 hover:bg-gray-100" onClick={() => runAI("Rewrite professionally")}>/rewrite</button>
          <button className="block w-full text-left px-2 py-1 hover:bg-gray-100" onClick={() => runAI("Summarize document")}>/summarize</button>
          <button className="block w-full text-left px-2 py-1 hover:bg-gray-100" onClick={() => runAI("Expand and enrich the document with more detail")}>/expand</button>
          <button className="block w-full text-left px-2 py-1 hover:bg-gray-100" onClick={() => runAI("Rewrite in a formal professional tone")}>/formal</button>
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  );
}
