export type Tool = {
  name: string;
  endpoint: string;
  method: "GET" | "POST";
};

export const toolRegistry: Record<string, Tool> = {
  summarize_document: {
    name: "summarize_document",
    endpoint: "http://document-service:4000/summarize",
    method: "POST"
  },
  convert_format: {
    name: "convert_format",
    endpoint: "http://conversion-service:4000/convert",
    method: "POST"
  },
  generate_text: {
    name: "generate_text",
    endpoint: "http://ai-service:4000/generate",
    method: "POST"
  }
};

export function getTool(name: string) {
  return toolRegistry[name];
}
