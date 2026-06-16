export type Document = {
  id: string;
  nodes: DocumentNode[];
};

export type DocumentNode =
  | ParagraphNode
  | HeadingNode
  | TableNode
  | TextNode;

export type TextNode = {
  type: "text";
  text: string;
};

export type ParagraphNode = {
  type: "paragraph";
  content: DocumentNode[];
};

export type HeadingNode = {
  type: "heading";
  level: 1 | 2 | 3 | 4 | 5 | 6;
  content: DocumentNode[];
};

export type TableNode = {
  id: string;
  type: "table";
  attrs: TableAttributes;
  rows: TableRowNode[];
};

export type TableAttributes = {
  striped: boolean;
  boldHeader: boolean;
  condensed: boolean;
};

export type TableRowNode = {
  id: string;
  type: "row";
  isHeader?: boolean;
  cells: TableCellNode[];
};

export type TableCellNode = {
  id: string;
  type: "cell";
  content: DocumentNode[];
};