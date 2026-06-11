/**
 * runtime.ts
 * -------------------------------------------------
 * Unified system entrypoint (Phase 9)
 * Fully wired event-sourced execution + Redis stream consumption
 */

import { WorkerProcessManager } from './workerProcess';
import { RedisStreamConsumer } from './redisStreamConsumer';

/**
 * System Runtime Bootstrap
 */
export class Runtime {
  private manager: WorkerProcessManager;
  private consumer?: RedisStreamConsumer;

  constructor(workerCount = 2) {
    this.manager = new WorkerProcessManager(workerCount);
  }

  /**
   * Start full system
   */
  public async start() {
    console.log('[Runtime] Starting system (FULL EVENT-SOURCED MODE)...');

    // 1. Start worker pool
    this.manager.start();

    // 2. Build entity subscription list
    const entityIds = process.env.ENTITY_IDS
      ? process.env.ENTITY_IDS.split(',').map(s => s.trim())
      : ['default'];

    // 3. Start Redis stream consumer (event ingestion → execution)
    this.consumer = new RedisStreamConsumer(
      process.env.REDIS_URL || 'redis://localhost:6379',
      'event_group',
      `consumer-${Math.random().toString(36).slice(2)}`,
      this.manager
    );

    // 4. Run consumer loop (non-blocking)
    this.consumer.start(entityIds).catch(err => {
      console.error('[Runtime] Consumer crashed:', err);
    });

    console.log('[Runtime] Workers + Redis consumer active');
  }

  /**
   * Stop system
   */
  public async stop() {
    console.log('[Runtime] Stopping system...');

    await this.consumer?.disconnect();
  }

  /**
   * System status snapshot
   */
  public status() {
    return {
      workers: this.manager.getStatus(),
      consumerRunning: !!this.consumer,
    };
  }
}

/**
 * Auto-start if executed directly
 */
const isMain = require.main === module;

if (isMain) {
  const runtime = new Runtime(2);
  runtime.start();
}