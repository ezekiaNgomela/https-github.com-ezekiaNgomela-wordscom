/**
 * clusterState.ts
 * -------------------------------------------------
 * Production hardening (Phase 12 Fix): Cluster Epoch + State Versioning
 *
 * Introduces a single source of truth for cluster configuration.
 */

import { createClient } from 'redis';

export class ClusterState {
  private client;

  private static STATE_KEY = 'cluster:state';

  constructor(redisUrl: string) {
    this.client = createClient({ url: redisUrl });

    this.client.on('error', (err) => {
      console.error('[ClusterState] Redis error:', err);
    });
  }

  async connect() {
    await this.client.connect();
  }

  /**
   * Initialize or increment cluster epoch
   */
  async bumpEpoch(): Promise<number> {
    const current = await this.client.hGet(ClusterState.STATE_KEY, 'epoch');
    const next = (Number(current || 0) + 1);

    await this.client.hSet(ClusterState.STATE_KEY, {
      epoch: String(next),
      updatedAt: String(Date.now())
    });

    return next;
  }

  /**
   * Get current cluster epoch
   */
  async getEpoch(): Promise<number> {
    const epoch = await this.client.hGet(ClusterState.STATE_KEY, 'epoch');
    return Number(epoch || 0);
  }

  async disconnect() {
    await this.client.quit();
  }
}