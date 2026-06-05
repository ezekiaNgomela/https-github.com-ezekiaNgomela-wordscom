// Phase 34.1 - Editor Canvas Engine (Notion-style Interactive Editor)
// Core frontend surface for WordCom document editing

import React, { useEffect, useState } from "react";
import { BlockRenderer, Block } from "./BlockRenderer";

interface Document {
  id: string;
  title: string;
  blocks: Block[];
}

export function EditorCanvas({ documentId }: { documentId: string }) {
  const [doc, setDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDocument() {
      setLoading(true);

      const res = await fetch(`/api/documents/${documentId}`);
      const data = await res.json();

      setDoc(data);
      setLoading(false);
    }

    loadDocument();
  }, [documentId]);

  if (loading) return <div className="p-4">Loading document...</div>;
  if (!doc) return <div className="p-4">Document not found</div>;

  return (
    <div className="w-full max-w-3xl mx-auto p-6">
      {/* Title */}
      <input
        className="text-3xl font-bold w-full outline-none mb-6"
        value={doc.title}
        onChange={(e) => setDoc({ ...doc, title: e.target.value })}
        onBlur={async () => {
          await fetch(`/api/documents/${doc.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: doc.title }),
          });
        }}
      />

      {/* Blocks */}
      <div className="space-y-2">
        {doc.blocks.map((block) => (
          <div
            key={block.id}
            contentEditable
            suppressContentEditableWarning
            onBlur={async (e) => {
              const updatedText = e.currentTarget.innerText;

              setDoc((prev) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  blocks: prev.blocks.map((b) =>
                    b.id === block.id ? { ...b, content: updatedText } : b
                  ),
                };
              });

              await fetch(`/api/blocks/${block.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: updatedText }),
              });
            }}
          >
            <BlockRenderer block={block} />
          </div>
        ))}
      </div>
    </div>
  );
}
