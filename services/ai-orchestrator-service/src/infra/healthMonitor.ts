import { publish } from "../core/messageBus";
import { listAgents, updateAgent } from "../core/agentRegistry";

/**
 * PHASE 11: HEALTH MONITOR
 * Detects failures and performs recovery actions
 */

export type HealthStatus = {
  healthy: boolean;
  degraded: boolean;
  failedAgents: string[];
};

export function evaluateHealth(): HealthStatus {
  const agents = listAgents();

  const failedAgents = agents
    .filter(a => a.status === "offline" || a.status === "busy")
    .map(a => a.id);

  const healthy = failedAgents.length === 0;

  return {
    healthy,
    degraded: failedAgents.length > 0 && failedAgents.length < 3,
    failedAgents
  };
}

export function runHealthCheck() {
  const status = evaluateHealth();

  publish({
    id: `health-${Date.now()}`,
    type: "system_event",
    payload: { stage: "health_check", status },
    timestamp: Date.now()
  });

  // auto-recovery (simple heuristic)
  if (status.failedAgents.length > 0) {
    for (const id of status.failedAgents) {
      updateAgent(id, { status: "idle" });
    }
  }

  return status;
}