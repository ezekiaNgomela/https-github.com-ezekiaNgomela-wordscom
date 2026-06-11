/**
 * redisEventAdapter.ts
 * -------------------------------------------------
 * Phase 7: Redis-backed Event Storage Adapter
 *
 * This replaces in-memory event storage with Redis Streams.
 * Provides durability, ordering, and distributed coordination.
 *
 * NOTE: Requires `redis` client (node-redis v4+).
 */

import { createClient } from 'redis';
import { BaseEvent } from './eventStore';

export class RedisEventAdapter {
  private client;
  private connected = false;

  constructor(redisUrl: string) {
    this.client = createClient({ url: redisUrl });

    this.client.on('error', (err) => {
      console.error('[RedisEventAdapter] Error:', err);
    });
  }

  async connect() {
    if (!this.connected) {
      await this.client.connect();
      this.connected = true;
      console.log('[RedisEventAdapter] Connected to Redis');
    }
  }

  private streamKey(entityId: string) {
    return `events:${entityId}`;
  }

  /**
   * Append event to Redis Stream
   */
  async append(event: BaseEvent): Promise<void> {
    await this.connect();

    const key = this.streamKey(event.entityId);

    await this.client.xAdd(key, '*', {
      id: event.id,
      type: event.type,
      entityId: event.entityId,
      version: String(event.version),
      timestamp: String(event.timestamp),
      causalChainId: event.causalChainId,
      payload: JSON.stringify(event.payload),
    });
  }

  /**
   * Get full stream (replay capability)
   */
  async getStream(entityId: string): Promise<BaseEvent[]> {
    await this.connect();

    const key = this.streamKey(entityId);

    const data = await this.client.xRange(key, '-', '+');

    return data.map((entry: any) => {
      const fields = entry.message;

      return {
        id: fields.id,
        type: fields.type,
        entityId: fields.entityId,
        version: Number(fields.version),
        timestamp: Number(fields.timestamp),
        causalChainId: fields.causalChainId,
        payload: JSON.parse(fields.payload),
      };
    });
  }

  /**
   * Get latest version for optimistic concurrency
   */
  async getLatestVersion(entityId: string): Promise<number> {
    await this.connect();

    const stream = await this.getStream(entityId);

    if (stream.length === 0) return 0;

    return stream[stream.length - 1].version;
  }

  async disconnect() {
    if (this.connected) {
      await this.client.quit();
      this.connected = false;
    }
  }
}