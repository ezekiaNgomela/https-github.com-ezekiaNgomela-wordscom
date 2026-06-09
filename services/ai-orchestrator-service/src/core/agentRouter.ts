import { AgentType, listAgents } from "./agentRegistry";
import { publish } from "./messageBus";

export type RouteRequest = {
  id: string;
  type: "task" | "memory" | "execution" | "validation";
  payload: any;
};

function resolveAgent(type: RouteRequest["type"]): AgentType {
  switch (type) {
    case "task":
      return "planner";
    case "execution":
      return "executor";
    case "memory":
      return "memory";
    case "validation":
      return "critic";
    default:
      return "monitor";
  }
}

export function route(request: RouteRequest) {
  const agentType = resolveAgent(request.type);

  const available = listAgents().filter(a => a.type === agentType && a.status === "idle");

  const selected = available[0];

  publish({
    id: `route-${Date.now()}`,
    type: "agent_event",
    payload: {
      request,
      assignedAgent: selected?.id || null,
      agentType
    },
    timestamp: Date.now()
  });

  return {
    assignedAgent: selected?.id || null,
    agentType
  };
}