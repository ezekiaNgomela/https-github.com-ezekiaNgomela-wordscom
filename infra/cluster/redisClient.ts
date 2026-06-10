/**
 * cluster/redisClient.ts
 * -------------------------------------------------
 * Phase 11: Distributed System Backbone
 * Redis abstraction layer for:
 * - leader election (SETNX + TTL)
 * - pub/sub cluster events
 * - shared job queue
 *
 * NOTE:
 * Requires: ioredis
 */

import Redis from 'ioredis';

export class RedisClient {
  public pub: Redis;
  public sub: Redis;
  public kv: Redis;

  constructor(redisUrl: string) {
    this.pub = new Redis(redisUrl);
    this.sub = new Redis(redisUrl);
    this.kv = new Redis(redisUrl);
  }

  /**
   * Acquire distributed lock (leader election primitive)
   */
  async acquireLock(key: string, value: string, ttlMs: number): Promise<boolean> {
    const result = await this.kv.set(key, value, 'PX', ttlMs, 'NX');
    return result === 'OK';
  }

  /**
   * Extend lock TTL (leader heartbeat)
   */
  async extendLock(key: string, value: string, ttlMs: number): Promise<boolean> {
    const current = await this.kv.get(key);
    if (current !== value) return false;

    await this.kv.pexpire(key, ttlMs);
    return true;
  }

  /**
   * Release lock safely
   */
  async releaseLock(key: string, value: string): Promise<void> {
    const current = await this.kv.get(key);
    if (current === value) {
      await this.kv.del(key);
    }
  }

  /**
   * Publish cluster event
   */
  publish(channel: string, message: any) {
    return this.pub.publish(channel, JSON.stringify(message));
  }

  /**
   * Subscribe to cluster events
   */
  subscribe(channel: string, handler: (msg: any) => void) {
    this.sub.subscribe(channel);
    this.sub.on('message', (_channel, message) => {
      try {
        handler(JSON.parse(message));
      } catch (e) {
        console.error('[RedisClient] Invalid message', e);
      }
    });
  }

  /**
   * Push job into global queue
   */
  async pushJob(queue: string, job: any) {
    await this.kv.lpush(queue, JSON.stringify(job));
  }

  /**
   * Pop job from global queue
   */
  async popJob(queue: string) {
    const job = await this.kv.rpop(queue);
    return job ? JSON.parse(job) : null;
  }
}
