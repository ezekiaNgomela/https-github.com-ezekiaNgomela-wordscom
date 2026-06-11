/**
 * redisStreamConsumer.ts
 * -------------------------------------------------
 * Phase 8 + 10 + 11: Stream Consumer with Retry + DLQ + Backpressure
 */

import { createClient } from 'redis';
import { WorkerProcessManager } from './workerProcess';
import { BaseEvent } from './eventStore';
import { DeadLetterQueue } from './deadLetterQueue';
import { RetryPolicy } from './retryPolicy';
import { BackpressureController } from './backpressureController';

export class RedisStreamConsumer {
  private client;
  private running = false;
  private dlq: DeadLetterQueue;
  private retryPolicy: RetryPolicy;
  private backpressure: BackpressureController;

  constructor(
    private redisUrl: string,
    private group: string,
    private consumer: string,
    private manager: WorkerProcessManager
  ) {
    this.client = createClient({ url: redisUrl });
    this.dlq = new DeadLetterQueue(redisUrl);
    this.retryPolicy = new RetryPolicy(3);
    this.backpressure = new BackpressureController(10);

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

    for (const id of entityIds) {
      const key = this.streamKey(id);

      try {
        await this.client.xGroupCreate(key, this.group, '0', { MKSTREAM: true });
      } catch (err: any) {}
    }

    while (this.running) {
      try {
        const status: any = this.manager.getStatus();
        const inFlight = status.inFlight ?? status.busy ?? status.active ?? 0;

        const shouldPause = this.backpressure.shouldPause(inFlight);
        const batchSize = this.backpressure.getBatchSize(inFlight);

        if (shouldPause || batchSize === 0) {
          await new Promise(r => setTimeout(r, 500));
          continue;
        }

        for (const id of entityIds) {
          const key = this.streamKey(id);

          const response = await this.client.xReadGroup(
            this.group,
            this.consumer,
            { key, id: '>' },
            { COUNT: batchSize, BLOCK: 1000 }
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

              let attempt = 0;
              let success = false;

              while (!success) {
                try {
                  this.manager.dispatch(event);
                  success = true;
                } catch (err) {
                  attempt++;

                  if (this.retryPolicy.shouldRetry({ eventId: event.id, attempt, error: err })) {
                    const delay = this.retryPolicy.getDelayMs(attempt);
                    await new Promise(r => setTimeout(r, delay));
                  } else {
                    await this.dlq.push(event, String(err));
                    break;
                  }
                }
              }

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