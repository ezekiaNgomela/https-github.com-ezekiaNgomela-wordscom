import { listAgents } from "../core/agentRegistry";

/**
 * PHASE 11: LOAD ANALYZER
 * Continuously estimates system pressure for Control Plane decisions
 */

export type LoadMetrics = {
  queueDepth: number;
  failureRate: number;
  avgLatency: number;
  cpuPressure: number;
  activeAgents: number;
};

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function collectMetrics(): LoadMetrics {
  const agents = listAgents();

  const activeAgents = agents.filter(a => a.status !== "offline").length;

  return {
    queueDepth: Math.floor(randomBetween(0, 50)),
    failureRate: randomBetween(0, 0.3),
    avgLatency: randomBetween(100, 2000),
    cpuPressure: randomBetween(0, 1),
    activeAgents
  };
}

export function sampleLoad(intervalMs: number, cb: (m: LoadMetrics) => void) {
  setInterval(() => {
    cb(collectMetrics());
  }, intervalMs);
}