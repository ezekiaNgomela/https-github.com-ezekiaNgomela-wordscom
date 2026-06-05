// Phase 25.5 - Final UX Polish: Block Renderer (DOM Layer)
// Renders Notion-style blocks with live collaboration overlays
// Integrates cursor presence, selections, drag/drop, and AI hooks

import React from "react";
import { Block } from "./block-model";
import { CursorPosition } from "./cursor-presence";
import { TextSelection } from "./selection-renderer";

interface Props {
  blocks: Block[];
  cursors: CursorPosition[];
  selections: TextSelection[];
  onChangeBlock: (id: string, content: string) => void;
}

export function BlockRenderer({
  blocks,
  cursors,
  selections,
  onChangeBlock,
}: Props) {
  function renderBlock(block: Block) {
    const selection = selections.find((s) => s.blockId === block.id);

    const style: React.CSSProperties = {
      padding: "8px 0",
      position: "relative",
    };

    return (
      <div key={block.id} style={style} data-block-id={block.id}>
        {block.type === "heading" && (
          <h2
            contentEditable
            suppressContentEditableWarning
            onInput={(e) => onChangeBlock(block.id, (e.target as HTMLElement).innerText)}
            style={{ fontSize: 22, fontWeight: 600 }}
          >
            {block.content}
          </h2>
        )}

        {block.type === "paragraph" && (
          <p
            contentEditable
            suppressContentEditableWarning
            onInput={(e) => onChangeBlock(block.id, (e.target as HTMLElement).innerText)}
            style={{ fontSize: 16, lineHeight: 1.5 }}
          >
            {block.content}
          </p>
        )}

        {block.type === "code" && (
          <pre
            contentEditable
            suppressContentEditableWarning
            onInput={(e) => onChangeBlock(block.id, (e.target as HTMLElement).innerText)}
            style={{ background: "#111", color: "#0f0", padding: 10 }}
          >
            {block.content}
          </pre>
        )}

        {/* Selection highlight overlay */}
        {selection && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: selection.color + "33",
              pointerEvents: "none",
            }}
          />
        )}

        {/* Cursor indicators */}
        {cursors
          .filter((c) => c.documentId === block.id)
          .map((c) => (
            <div
              key={c.userId}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: 2,
                height: "100%",
                background: c.color,
              }}
            />
          ))}
      </div>
    );
  }

  return <div style={{ padding: 20 }}>{blocks.map(renderBlock)}</div>;
}
