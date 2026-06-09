import { executePlan } from "../agent/executor";
import { publish } from "../core/messageBus";
import { registerAgent, updateAgent } from "../core/agentRegistry";

const agent = registerAgent({
  id: "executor-agent-1",
  type: "executor",
  status: "idle",
  metadata: { version: "7.0" }
});

export async function runExecutorAgent(task: any, plan: any) {
  try {
    updateAgent(agent.id, { status: "busy" });

    publish({
      id: `executor-${Date.now()}`,
      type: "agent_event",
      from: agent.id,
      payload: { stage: "execution_started", task, plan },
      timestamp: Date.now()
    });

    const results = await executePlan(plan);

    publish({
      id: `executor-${Date.now()}`,
      type: "agent_event",
      from: agent.id,
      payload: { stage: "execution_completed", results },
      timestamp: Date.now()
    });

    updateAgent(agent.id, { status: "idle" });

    return results;

  } catch (err: any) {
    updateAgent(agent.id, { status: "idle" });

    publish({
      id: `executor-${Date.now()}`,
      type: "system_event",
      from: agent.id,
      payload: { error: err.message },
      timestamp: Date.now()
    });

    throw err;
  }
}