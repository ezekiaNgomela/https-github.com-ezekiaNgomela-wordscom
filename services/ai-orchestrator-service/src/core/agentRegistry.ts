export type AgentType =
  | "planner"
  | "executor"
  | "memory"
  | "critic"
  | "monitor"
  | "scheduler";

export type Agent = {
  id: string;
  type: AgentType;
  status: "idle" | "busy" | "offline";
  metadata?: Record<string, any>;
};

const agents: Map<string, Agent> = new Map();

export function registerAgent(agent: Agent) {
  agents.set(agent.id, agent);
  return agent;
}

export function getAgent(id: string) {
  return agents.get(id);
}

export function listAgents() {
  return Array.from(agents.values());
}

export function getAgentsByType(type: AgentType) {
  return Array.from(agents.values()).filter(a => a.type === type);
}

export function updateAgent(id: string, patch: Partial<Agent>) {
  const agent = agents.get(id);
  if (!agent) return;

  const updated = { ...agent, ...patch };
  agents.set(id, updated);
  return updated;
}