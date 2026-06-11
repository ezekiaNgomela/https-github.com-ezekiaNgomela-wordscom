/**
 * rebalanceEngine.ts
 * -------------------------------------------------
 * Production hardening: Cluster Rebalancing Control Plane
 *
 * Owned by LEADER only.
 * Responsible for computing and publishing partition assignments.
 */

import { PartitionRegistry } from './partitionRegistry';
import { ClusterState } from './clusterState';

export class RebalanceEngine {
  constructor(
    private redisUrl: string,
    private registry: PartitionRegistry,
    private state: ClusterState
  ) {}

  /**
   * Deterministic assignment using consistent hashing (stable base v1)
   */
  private buildAssignments(entityIds: string[], nodeIds: string[]): Record<string, string> {
    const sortedNodes = [...nodeIds].sort();

    const hash = (input: string) => {
      let h = 0;
      for (let i = 0; i < input.length; i++) {
        h = (h * 31 + input.charCodeAt(i)) >>> 0;
      }
      return h;
    };

    const assignments: Record<string, string> = {};

    for (const entityId of entityIds) {
      const idx = hash(entityId) % sortedNodes.length;
      assignments[entityId] = sortedNodes[idx];
    }

    return assignments;
  }

  /**
   * Execute full rebalance cycle
   */
  async rebalance(entityIds: string[], nodeIds: string[]) {
    if (!nodeIds.length) throw new Error('No nodes available for rebalance');

    // 1. bump epoch (forces cluster-wide consistency barrier)
    const epoch = await this.state.bumpEpoch();

    // 2. compute assignments
    const assignments = this.buildAssignments(entityIds, nodeIds);

    // 3. publish authoritative mapping
    await this.registry.setAssignments(epoch, assignments);

    console.log(`[RebalanceEngine] Rebalanced cluster at epoch=${epoch}`);
    console.log(`[RebalanceEngine] entities=${Object.keys(assignments).length}`);

    return { epoch, assignments };
  }
}