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

function getReputationScore(agent: any): number {
  return Number(agent?.metadata?.reputationScore ?? 0);
}

export function route(request: RouteRequest) {
  const agentType = resolveAgent(request.type);

  const available = listAgents()
    .filter(a => a.type === agentType && a.status === "idle")
    .sort((a, b) => getReputationScore(b) - getReputationScore(a));

  const selected = available[0];

  publish({
    id: `route-${Date.now()}`,
    type: "agent_event",
    payload: {
      request,
      assignedAgent: selected?.id || null,
      agentType,
      routingStrategy: "reputation_weighted"
    },
    timestamp: Date.now()
  });

  return {
    assignedAgent: selected?.id || null,
    agentType
  };
}
