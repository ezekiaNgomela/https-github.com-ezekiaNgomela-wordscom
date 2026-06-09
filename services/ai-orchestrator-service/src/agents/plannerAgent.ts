import { createLLMPlan } from "../agent/llmPlanner";
import { publish } from "../core/messageBus";
import { registerAgent } from "../core/agentRegistry";

const agent = registerAgent({
  id: "planner-agent-1",
  type: "planner",
  status: "idle",
  metadata: { version: "7.0" }
});

export async function runPlannerAgent(task: any) {
  try {
    publish({
      id: `planner-${Date.now()}`,
      type: "agent_event",
      from: agent.id,
      payload: { stage: "planning_started", task },
      timestamp: Date.now()
    });

    const plan = await createLLMPlan(task.payload, task.id);

    publish({
      id: `planner-${Date.now()}`,
      type: "agent_event",
      from: agent.id,
      payload: { stage: "planning_completed", plan },
      timestamp: Date.now()
    });

    return plan;
  } catch (err: any) {
    publish({
      id: `planner-${Date.now()}`,
      type: "system_event",
      from: agent.id,
      payload: { error: err.message },
      timestamp: Date.now()
    });

    throw err;
  }
}