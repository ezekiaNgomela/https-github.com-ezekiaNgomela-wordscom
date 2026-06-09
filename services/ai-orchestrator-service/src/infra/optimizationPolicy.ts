/**
 * PHASE 12: OPTIMIZATION POLICY ENGINE
 * Converts predictions into scaling decisions
 */

import { predictNextState } from "./predictionEngine";
import { scaleAgents } from "./agentSpawner";

export type OptimizationAction =
  | { action: "scale_up"; target: string; amount: number }
  | { action: "scale_down"; target: string; amount: number }
  | { action: "noop" };

export function optimizeSystem(): OptimizationAction {
  const prediction = predictNextState();

  if (prediction.predictedQueueDepth > 40) {
    scaleAgents("executor", 2);
    return { action: "scale_up", target: "executor", amount: 2 };
  }

  if (prediction.predictedFailureRate > 0.5) {
    scaleAgents("critic", 1);
    return { action: "scale_up", target: "critic", amount: 1 };
  }

  if (prediction.predictedQueueDepth < 10) {
    return { action: "scale_down", target: "executor", amount: 1 };
  }

  return { action: "noop" };
}