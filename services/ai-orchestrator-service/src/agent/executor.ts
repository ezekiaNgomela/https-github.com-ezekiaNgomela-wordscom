import fetch from "node-fetch";
import { getTool } from "./toolRegistry";
import { Plan } from "./planner";

export async function executePlan(plan: Plan) {
  const results: any[] = [];

  for (const step of plan.steps) {
    const tool = getTool(step.tool);

    if (!tool) {
      results.push({ error: `Unknown tool: ${step.tool}` });
      continue;
    }

    try {
      const res = await fetch(tool.endpoint, {
        method: tool.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(step.input)
      });

      const data = await res.json();
      results.push({ tool: step.tool, data });
    } catch (err: any) {
      results.push({ tool: step.tool, error: err.message });
    }
  }

  return results;
}
