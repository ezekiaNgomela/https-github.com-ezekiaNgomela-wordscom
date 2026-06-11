/**
 * redisStreamConsumer.ts
 * -------------------------------------------------
 * Phase 8: True Stream Consumption Model
 *
 * Replaces push-based worker dispatch with Redis Stream consumer groups.
 * Workers now consume events instead of receiving direct dispatch calls.
 */

import { createClient } from 'redis';
import { WorkerProcessManager } from './workerProcess';
import { BaseEvent } from './eventStore';

export class RedisStreamConsumer {
  private client;
  private running = false;

  constructor(
    private redisUrl: string,
    private group: string,
    private consumer: string,
    private manager: WorkerProcessManager
  ) {
    this.client = createClient({ url: redisUrl });

    this.client.on('error', (err) => {
      console.error('[RedisStreamConsumer] Error:', err);
    });
  }

  private streamKey(entityId: string) {
    return `events:${entityId}`;
  }

  async start(entityIds: string[]) {
    await this.client.connect();
    this.running = true;

    console.log('[RedisStreamConsumer] Starting consumer loop...');

    // Ensure consumer group exists per stream
    for (const id of entityIds) {
      const key = this.streamKey(id);

      try {
        await this.client.xGroupCreate(key, this.group, '0', { MKSTREAM: true });
      } catch (err: any) {
        // group already exists
      }
    }

    while (this.running) {
      try {
        for (const id of entityIds) {
          const key = this.streamKey(id);

          const response = await this.client.xReadGroup(
            this.group,
            this.consumer,
            {
              key,
              id: '>'
            },
            {
              COUNT: 10,
              BLOCK: 1000
            }
          );

          if (!response) continue;

          for (const stream of response) {
            for (const message of stream.messages) {
              const fields = message.message as any;

              const event: BaseEvent = {
                id: fields.id,
                type: fields.type,
                entityId: fields.entityId,
                version: Number(fields.version),
                timestamp: Number(fields.timestamp),
                causalChainId: fields.causalChainId,
                payload: JSON.parse(fields.payload),
              };

              // Push into existing worker pool (reuses execution layer)
              this.manager.dispatch(event);

              // ACK message
              await this.client.xAck(key, this.group, message.id);
            }
          }
        }
      } catch (err) {
        console.error('[RedisStreamConsumer] loop error:', err);
      }
    }
  }

  stop() {
    this.running = false;
  }

  async disconnect() {
    await this.client.quit();
  }
}