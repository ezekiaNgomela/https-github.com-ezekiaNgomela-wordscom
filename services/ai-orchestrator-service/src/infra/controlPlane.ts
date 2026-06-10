import { listAgents } from "../core/agentRegistry";
import { publish } from "../core/messageBus";

/**
 * PHASE 11: AI CONTROL PLANE
 * Decides scaling actions based on system state + agent quality
 */

export type SystemMetrics = {
  queueDepth: number;
  failureRate: number;
  avgLatency: number;
  cpuPressure: number;
};

export type ScalingAction =
  | { type: "scale_up"; agentType: string; amount: number }
  | { type: "scale_down"; agentType: string; amount: number }
  | { type: "no_op" };

function getAvgReputation(): number {
  const agents = listAgents();
  if (!agents.length) return 0;

  const sum = agents.reduce((acc, a) => {
    return acc + (Number(a?.metadata?.reputationScore ?? 0) / 1000);
  }, 0);

  return sum / agents.length;
}

export function evaluateSystem(metrics: SystemMetrics): ScalingAction {
  const avgReputation = getAvgReputation();

  // LOW TRUST SYSTEM → prioritize critics
  if (avgReputation < 0.4) {
    return { type: "scale_up", agentType: "critic", amount: 2 };
  }

  // HIGH LOAD CONDITIONS
  if (metrics.queueDepth > 20 || metrics.avgLatency > 1000) {
    return { type: "scale_up", agentType: "executor", amount: 2 };
  }

  // FAILURE CONDITIONS → improve validation capacity
  if (metrics.failureRate > 0.2) {
    return { type: "scale_up", agentType: "critic", amount: 1 };
  }

  // LOW LOAD → scale down safe workers
  if (metrics.cpuPressure < 0.2 && avgReputation > 0.6) {
    return { type: "scale_down", agentType: "executor", amount: 1 };
  }

  return { type: "no_op" };
}

export function runControlPlane(metrics: SystemMetrics) {
  const action = evaluateSystem(metrics);

  publish({
    id: `control-${Date.now()}`,
    type: "system_event",
    payload: { stage: "control_decision", action, reputationAware: true },
    timestamp: Date.now()
  });

  return action;
}
