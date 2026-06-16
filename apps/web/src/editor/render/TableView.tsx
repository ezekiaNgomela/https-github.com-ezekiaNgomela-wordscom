import React from "react";
import { TableNode } from "../types/document";

function getTableClass(attrs: TableNode["attrs"]) {
  return [
    attrs.striped && "table-striped",
    attrs.boldHeader && "table-bold-header",
    attrs.condensed && "table-condensed",
  ]
    .filter(Boolean)
    .join(" ");
}

export function TableView({ node }: { node: TableNode }) {
  return (
    <table className={getTableClass(node.attrs)}>
      <tbody>
        {node.rows.map((row) => (
          <tr key={row.id}>
            {row.cells.map((cell) => (
              <td key={cell.id}>
                {cell.content?.map((n: any, i: number) => {
                  if (n.type === "text") return <span key={i}>{n.text}</span>;
                  return null;
                })}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
