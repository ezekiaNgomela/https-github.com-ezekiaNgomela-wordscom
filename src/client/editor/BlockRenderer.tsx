// Phase 34 - Frontend Editor UI (Block Renderer)
// Renders Notion-style blocks for WordCom editor

import React from "react";

export type BlockType =
  | "paragraph"
  | "heading1"
  | "heading2"
  | "heading3"
  | "bullet_list"
  | "numbered_list"
  | "todo"
  | "quote"
  | "code"
  | "divider"
  | "image";

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  metadata?: {
    checked?: boolean;
    language?: string;
    url?: string;
  };
}

export function BlockRenderer({ block }: { block: Block }) {
  switch (block.type) {
    case "paragraph":
      return <p className="w-full py-1 text-base">{block.content}</p>;

    case "heading1":
      return <h1 className="text-3xl font-bold py-2">{block.content}</h1>;

    case "heading2":
      return <h2 className="text-2xl font-semibold py-2">{block.content}</h2>;

    case "heading3":
      return <h3 className="text-xl font-medium py-1">{block.content}</h3>;

    case "quote":
      return (
        <blockquote className="border-l-4 pl-3 italic text-gray-600">
          {block.content}
        </blockquote>
      );

    case "code":
      return (
        <pre className="bg-gray-900 text-white p-3 rounded">
          <code>{block.content}</code>
        </pre>
      );

    case "todo":
      return (
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={block.metadata?.checked} readOnly />
          <span>{block.content}</span>
        </div>
      );

    case "bullet_list":
      return <li className="list-disc ml-6">{block.content}</li>;

    case "numbered_list":
      return <li className="list-decimal ml-6">{block.content}</li>;

    case "divider":
      return <hr className="my-4" />;

    case "image":
      return (
        <img
          src={block.metadata?.url || block.content}
          alt="block"
          className="max-w-full rounded"
        />
      );

    default:
      return <p>{block.content}</p>;
  }
}
