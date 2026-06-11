/**
 * deadLetterQueue.ts
 * -------------------------------------------------
 * Phase 10: Dead Letter Queue (DLQ)
 *
 * Captures failed events that cannot be processed successfully.
 * Enables inspection, replay, and debugging of poisoned events.
 */

import { createClient } from 'redis';
import { BaseEvent } from './eventStore';

export class DeadLetterQueue {
  private client;
  private connected = false;

  constructor(private redisUrl: string) {
    this.client = createClient({ url: redisUrl });

    this.client.on('error', (err) => {
      console.error('[DLQ] Redis error:', err);
    });
  }

  async connect() {
    if (!this.connected) {
      await this.client.connect();
      this.connected = true;
    }
  }

  private key() {
    return 'dlq:events';
  }

  async push(event: BaseEvent, reason: string) {
    await this.connect();

    await this.client.xAdd(this.key(), '*', {
      id: event.id,
      type: event.type,
      entityId: event.entityId,
      version: String(event.version),
      timestamp: String(event.timestamp),
      causalChainId: event.causalChainId,
      payload: JSON.stringify(event.payload),
      reason
    });
  }

  async readAll() {
    await this.connect();

    const data = await this.client.xRange(this.key(), '-', '+');

    return data.map((entry: any) => ({
      id: entry.message.id,
      type: entry.message.type,
      entityId: entry.message.entityId,
      version: Number(entry.message.version),
      timestamp: Number(entry.message.timestamp),
      causalChainId: entry.message.causalChainId,
      payload: JSON.parse(entry.message.payload),
      reason: entry.message.reason
    }));
  }

  async disconnect() {
    await this.client.quit();
  }
}