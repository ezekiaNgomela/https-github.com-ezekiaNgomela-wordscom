import { listAgents } from "../core/agentRegistry";
import { publish } from "../core/messageBus";

/**
 * PHASE 11: AI CONTROL PLANE
 * Decides scaling actions based on system state
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

export function evaluateSystem(metrics: SystemMetrics): ScalingAction {
  if (metrics.queueDepth > 20 || metrics.avgLatency > 1000) {
    return { type: "scale_up", agentType: "executor", amount: 2 };
  }

  if (metrics.failureRate > 0.2) {
    return { type: "scale_up", agentType: "critic", amount: 1 };
  }

  if (metrics.cpuPressure < 0.2) {
    return { type: "scale_down", agentType: "executor", amount: 1 };
  }

  return { type: "no_op" };
}

export function runControlPlane(metrics: SystemMetrics) {
  const action = evaluateSystem(metrics);

  publish({
    id: `control-${Date.now()}`,
    type: "system_event",
    payload: { stage: "control_decision", action },
    timestamp: Date.now()
  });

  return action;
}