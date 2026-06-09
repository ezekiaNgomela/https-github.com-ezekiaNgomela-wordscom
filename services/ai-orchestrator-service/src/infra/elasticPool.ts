import { spawnAgent, scaleAgents } from "./agentSpawner";
import { publish } from "../core/messageBus";
import { collectMetrics } from "./loadAnalyzer";

/**
 * PHASE 11: ELASTIC WORKER POOL
 * Manages dynamic scaling of worker nodes based on system load
 */

export type WorkerPoolState = {
  executors: number;
  planners: number;
  critics: number;
  memory: number;
};

const state: WorkerPoolState = {
  executors: 1,
  planners: 1,
  critics: 1,
  memory: 1
};

export function getPoolState() {
  return state;
}

export function reconcilePool() {
  const metrics = collectMetrics();

  // Scale executors based on queue/latency
  if (metrics.queueDepth > 20 || metrics.avgLatency > 1200) {
    scaleAgents("executor", 2);
    state.executors += 2;
  }

  // Scale critics on failure rate
  if (metrics.failureRate > 0.2) {
    scaleAgents("critic", 1);
    state.critics += 1;
  }

  // Scale down under low CPU pressure
  if (metrics.cpuPressure < 0.25 && state.executors > 1) {
    state.executors -= 1;
  }

  publish({
    id: `pool-${Date.now()}`,
    type: "system_event",
    payload: { stage: "pool_reconciled", state, metrics },
    timestamp: Date.now()
  });

  return state;
}

export function startAutoScaling(intervalMs: number = 2000) {
  setInterval(() => {
    reconcilePool();
  }, intervalMs);
}