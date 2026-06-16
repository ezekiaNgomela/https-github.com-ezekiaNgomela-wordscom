import type { Document, TableNode, TableAttributes } from "../types/document";

/**
 * Default safe table attributes
 */
export function getDefaultTableAttributes(): TableAttributes {
  return {
    striped: false,
    boldHeader: false,
    condensed: false,
  };
}

/**
 * Ensures a table node is safe at runtime
 */
export function normalizeTable(node: TableNode): TableNode {
  return {
    ...node,
    attrs: {
      ...getDefaultTableAttributes(),
      ...(node.attrs || {}),
    },
    rows: Array.isArray(node.rows) ? node.rows : [],
  };
}

/**
 * Validates and normalizes entire document
 */
export function validateDocument(doc: Document | null | undefined): Document {
  if (!doc) {
    return {
      id: "empty",
      nodes: [],
    };
  }

  return {
    ...doc,
    nodes: (doc.nodes || []).map((node: any) => {
      if (!node) return node;

      if (node.type === "table") {
        return normalizeTable(node);
      }

      return node;
    }),
  };
}
