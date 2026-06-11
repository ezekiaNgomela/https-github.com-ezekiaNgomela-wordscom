/**
 * idempotencyStore.ts
 * -------------------------------------------------
 * Production hardening (Phase 12 Fix): Event Idempotency Layer
 *
 * Ensures events are processed exactly once per node/cluster.
 */

import { createClient } from 'redis';

export class IdempotencyStore {
  private client;

  private static PREFIX = 'idem:event:';

  constructor(redisUrl: string) {
    this.client = createClient({ url: redisUrl });

    this.client.on('error', (err) => {
      console.error('[IdempotencyStore] Redis error:', err);
    });
  }

  async connect() {
    await this.client.connect();
  }

  /**
   * Returns true if event is new, false if already processed
   */
  async markIfNew(eventId: string, ttlSeconds = 3600): Promise<boolean> {
    const key = IdempotencyStore.PREFIX + eventId;

    const result = await this.client.set(key, '1', {
      NX: true,
      EX: ttlSeconds
    });

    return result === 'OK';
  }

  async disconnect() {
    await this.client.quit();
  }
}