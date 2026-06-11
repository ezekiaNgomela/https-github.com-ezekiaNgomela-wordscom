/**
 * runtime.ts
 * -------------------------------------------------
 * Unified system entrypoint (Phase 12 - FINISHED)
 * Fully wired event-sourced execution + Redis cluster coordination
 */

import { WorkerProcessManager } from './workerProcess';
import { RedisStreamConsumer } from './redisStreamConsumer';
import { ClusterCoordinator } from './clusterCoordinator';
import { PartitionManager } from './partitionManager';

/**
 * System Runtime Bootstrap (Cluster Aware)
 */
export class Runtime {
  private manager: WorkerProcessManager;
  private consumer?: RedisStreamConsumer;
  private cluster?: ClusterCoordinator;
  private partition?: PartitionManager;

  constructor(workerCount = 2) {
    this.manager = new WorkerProcessManager(workerCount);
  }

  /**
   * Start full system (cluster-aware)
   */
  public async start() {
    console.log('[Runtime] Starting system (CLUSTER MODE)...');

    // 1. Start worker pool
    this.manager.start();

    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    // 2. Cluster coordination
    const nodeId = `node-${Math.random().toString(36).slice(2)}`;

    this.cluster = new ClusterCoordinator(redisUrl, nodeId);
    await this.cluster.connect();

    await this.cluster.registerNode();
    this.cluster.startElectionLoop();

    // 3. Build entity list
    const allEntities = process.env.ENTITY_IDS
      ? process.env.ENTITY_IDS.split(',').map(s => s.trim())
      : ['default'];

    // 4. Partition manager (initial nodes snapshot)
    const nodes = await this.cluster.getNodes();
    this.partition = new PartitionManager(nodes);

    const ownedEntities = this.partition.getOwnedEntities(allEntities, nodeId);

    console.log('[Runtime] Node:', nodeId);
    console.log('[Runtime] Cluster nodes:', nodes);
    console.log('[Runtime] Owned entities:', ownedEntities);

    // 5. Start Redis stream consumer (ONLY owned partitions)
    this.consumer = new RedisStreamConsumer(
      redisUrl,
      'event_group',
      nodeId,
      this.manager
    );

    this.consumer.start(ownedEntities).catch(err => {
      console.error('[Runtime] Consumer crashed:', err);
    });

    console.log('[Runtime] Cluster runtime active');
  }

  /**
   * Stop system
   */
  public async stop() {
    console.log('[Runtime] Stopping system...');

    await this.consumer?.disconnect();
    await this.cluster?.disconnect();
  }

  /**
   * System status snapshot
   */
  public status() {
    return {
      workers: this.manager.getStatus(),
      consumerRunning: !!this.consumer,
      clusterLeader: this.cluster?.isLeader() ?? false,
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