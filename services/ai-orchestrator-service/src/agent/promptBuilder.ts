import { toolRegistry } from "./toolRegistry";

export function buildPlannerPrompt(input: string, memoryContext?: any) {
  const tools = Object.values(toolRegistry)
    .map(t => `- ${t.name}: ${t.endpoint}`)
    .join("\n");

  return `You are an AI planner.
Convert the user request into a JSON execution plan.

RULES:
- Output ONLY valid JSON.
- Schema: { steps: [{ tool: string, input: object }] }
- Use only available tools.

TOOLS:
${tools}

MEMORY CONTEXT:
${memoryContext ? JSON.stringify(memoryContext, null, 2) : "none"}

USER REQUEST:
${input}

OUTPUT:
`;
}