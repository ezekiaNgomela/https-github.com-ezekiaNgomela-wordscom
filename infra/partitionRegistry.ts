/**
 * partitionRegistry.ts
 * -------------------------------------------------
 * Production hardening (Phase 12 Fix): Cluster Partition Registry
 *
 * Provides cluster-wide authoritative mapping of entity -> node ownership.
 */

import { createClient } from 'redis';

export class PartitionRegistry {
  private client;

  constructor(private redisUrl: string) {
    this.client = createClient({ url: redisUrl });

    this.client.on('error', (err) => {
      console.error('[PartitionRegistry] Redis error:', err);
    });
  }

  async connect() {
    await this.client.connect();
  }

  private key(epoch: number) {
    return `cluster:partition:${epoch}`;
  }

  /**
   * Assign full partition map for an epoch
   */
  async setAssignments(epoch: number, assignments: Record<string, string>) {
    const key = this.key(epoch);

    const pipeline = this.client.multi();

    for (const [entityId, nodeId] of Object.entries(assignments)) {
      pipeline.hSet(key, entityId, nodeId);
    }

    await pipeline.exec();
  }

  /**
   * Get owner for entity in epoch
   */
  async getOwner(epoch: number, entityId: string): Promise<string | null> {
    return this.client.hGet(this.key(epoch), entityId);
  }

  /**
   * Get full mapping
   */
  async getAll(epoch: number): Promise<Record<string, string>> {
    const data = await this.client.hGetAll(this.key(epoch));
    return data;
  }

  async disconnect() {
    await this.client.quit();
  }
}