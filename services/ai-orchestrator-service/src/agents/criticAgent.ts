import { publish } from "../core/messageBus";
import { registerAgent } from "../core/agentRegistry";

const agent = registerAgent({
  id: "critic-agent-1",
  type: "critic",
  status: "idle",
  metadata: { version: "7.0" }
});

export async function runCriticAgent(task: any, output: any) {
  try {
    publish({
      id: `critic-${Date.now()}`,
      type: "agent_event",
      from: agent.id,
      payload: { stage: "critique_started", task, output },
      timestamp: Date.now()
    });

    // Simple validation heuristics (extendable)
    const issues: string[] = [];

    if (!output) issues.push("Missing output");
    if (typeof output === "string" && output.trim().length === 0) {
      issues.push("Empty string output");
    }

    const passed = issues.length === 0;

    publish({
      id: `critic-${Date.now()}`,
      type: "agent_event",
      from: agent.id,
      payload: {
        stage: "critique_completed",
        passed,
        issues
      },
      timestamp: Date.now()
    });

    return { passed, issues };

  } catch (err: any) {
    publish({
      id: `critic-${Date.now()}`,
      type: "system_event",
      from: agent.id,
      payload: { error: err.message },
      timestamp: Date.now()
    });

    throw err;
  }
}