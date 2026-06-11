/**
 * clusterCoordinator.ts
 * -------------------------------------------------
 * Phase 12: Multi-Node Cluster Coordination
 *
 * Provides leader election + node registration using Redis.
 * Ensures only one active coordinator in the cluster.
 */

import { createClient } from 'redis';

export class ClusterCoordinator {
  private client;
  private nodeId: string;
  private isLeaderNode = false;
  private leaseInterval?: NodeJS.Timeout;

  private static LEADER_KEY = 'cluster:leader';
  private static NODES_KEY = 'cluster:nodes';

  constructor(redisUrl: string, nodeId: string) {
    this.client = createClient({ url: redisUrl });
    this.nodeId = nodeId;

    this.client.on('error', (err) => {
      console.error('[ClusterCoordinator] Redis error:', err);
    });
  }

  async connect() {
    await this.client.connect();
  }

  async tryBecomeLeader(): Promise<boolean> {
    const result = await this.client.set(
      ClusterCoordinator.LEADER_KEY,
      this.nodeId,
      { NX: true, EX: 5 }
    );

    this.isLeaderNode = result === 'OK';
    return this.isLeaderNode;
  }

  async renewLeadership() {
    if (!this.isLeaderNode) return;
    await this.client.expire(ClusterCoordinator.LEADER_KEY, 5);
  }

  async registerNode() {
    await this.client.sAdd(ClusterCoordinator.NODES_KEY, this.nodeId);
  }

  async getNodes(): Promise<string[]> {
    return this.client.sMembers(ClusterCoordinator.NODES_KEY);
  }

  startElectionLoop() {
    this.leaseInterval = setInterval(async () => {
      try {
        const becameLeader = await this.tryBecomeLeader();

        if (becameLeader) {
          await this.renewLeadership();
          console.log(`[ClusterCoordinator] Node ${this.nodeId} is LEADER`);
        }
      } catch (err) {
        console.error('[ClusterCoordinator] election error:', err);
      }
    }, 2000);
  }

  isLeader(): boolean {
    return this.isLeaderNode;
  }

  async disconnect() {
    if (this.leaseInterval) clearInterval(this.leaseInterval);
    await this.client.quit();
  }
}