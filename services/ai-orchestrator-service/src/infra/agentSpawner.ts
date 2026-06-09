import { registerAgent, AgentType } from "../core/agentRegistry";
import { publish } from "../core/messageBus";

/**
 * PHASE 11: AGENT SPAWNER
 * Dynamically creates and registers agents at runtime
 */

export function spawnAgent(type: AgentType, metadata: any = {}) {
  const id = `${type}-agent-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const agent = registerAgent({
    id,
    type,
    status: "idle",
    metadata: {
      ...metadata,
      spawnedAt: Date.now()
    }
  });

  publish({
    id: `spawn-${Date.now()}`,
    type: "system_event",
    payload: {
      stage: "agent_spawned",
      agent
    },
    timestamp: Date.now()
  });

  return agent;
}

export function scaleAgents(type: AgentType, count: number) {
  const created = [];

  for (let i = 0; i < count; i++) {
    created.push(spawnAgent(type));
  }

  publish({
    id: `scale-${Date.now()}`,
    type: "system_event",
    payload: {
      stage: "agents_scaled",
      type,
      count
    },
    timestamp: Date.now()
  });

  return created;
}