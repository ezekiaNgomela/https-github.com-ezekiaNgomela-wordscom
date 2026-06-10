// Phase 13B.1 - Agent Reputation Engine
// Drop-in module for distributed AI runtime

export type AgentId = string;

export interface AgentReputation {
  agentId: AgentId;

  score: number; // 0–1000

  dimensions: {
    reliability: number;
    accuracy: number;
    efficiency: number;
    latency: number;
    stability: number;
  };

  stats: {
    totalTasks: number;
    successfulTasks: number;
    failedTasks: number;
    lastUpdated: number;
  };

  decay: {
    lastDecayAt: number;
    decayRate: number;
  };

  volatility: number;
  confidence: number;
}

export interface TaskResultEvent {
  taskId: string;
  agentId: AgentId;
  status: "success" | "failure";
  metrics: {
    executionTimeMs: number;
    costUnits: number;
    retries: number;
  };
  criticScore: number;
  complexity: number;
  timestamp: number;
}

export interface ReputationUpdateEvent {
  agentId: AgentId;
  delta: number;
  newScore: number;
  timestamp: number;
}

const clamp = (v: number, min = -1, max = 1) => Math.max(min, Math.min(max, v));
const ema = (prev: number, next: number, a = 0.1) => prev * (1 - a) + next * a;
const normalizeDelta = (d: number) => Math.tanh(d);

export function computeReputationDelta(event: TaskResultEvent, agent: AgentReputation) {
  const Q = event.criticScore;
  const R = event.status === "success" ? 1 : -1;

  const expectedCost = 1;
  const E = clamp(1 - event.metrics.costUnits / expectedCost);

  const expectedTime = 1000;
  const L = clamp(1 - event.metrics.executionTimeMs / expectedTime);

  const W = 0.5 + event.complexity;

  return W * (0.45 * Q + 0.25 * R + 0.15 * E + 0.15 * L);
}

export function updateReputation(agent: AgentReputation, event: TaskResultEvent): ReputationUpdateEvent {
  const delta = computeReputationDelta(event, agent);

  const α = 0.05;
  const newScore = agent.score * (1 - α) + normalizeDelta(delta) * 1000 * α;

  const updated: AgentReputation = {
    ...agent,
    score: newScore,
    stats: {
      totalTasks: agent.stats.totalTasks + 1,
      successfulTasks: agent.stats.successfulTasks + (event.status === "success" ? 1 : 0),
      failedTasks: agent.stats.failedTasks + (event.status === "failure" ? 1 : 0),
      lastUpdated: Date.now()
    },
    dimensions: {
      reliability: ema(agent.dimensions.reliability, event.status === "success" ? 1 : 0),
      accuracy: ema(agent.dimensions.accuracy, event.criticScore),
      efficiency: ema(agent.dimensions.efficiency, event.metrics.costUnits),
      latency: ema(agent.dimensions.latency, event.metrics.executionTimeMs),
      stability: agent.dimensions.stability
    },
    volatility: agent.volatility,
    confidence: Math.log(1 + agent.stats.totalTasks) / Math.log(1000)
  };

  return {
    agentId: agent.agentId,
    delta,
    newScore,
    timestamp: Date.now()
  };
}

export function decayReputation(agent: AgentReputation): AgentReputation {
  const now = Date.now();
  const hours = (now - agent.stats.lastUpdated) / 3600000;
  const decay = Math.exp(-agent.decay.decayRate * hours);

  return {
    ...agent,
    score: agent.score * decay
  };
}