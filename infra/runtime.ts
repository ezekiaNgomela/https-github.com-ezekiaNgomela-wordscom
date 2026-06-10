/**
 * runtime.ts
 * -------------------------------------------------
 * Unified system entrypoint (Phase 4)
 *
 * This file activates the full distributed-capable runtime:
 * - WorkerProcessManager (multi-process layer)
 * - ExecutionBridge (queue → workers pipeline)
 * - Control loop integration hook (future binding)
 */

import { WorkerProcessManager } from './workerProcess';
import { ExecutionBridge } from './executionBridge';

/**
 * System Runtime Bootstrap
 */
export class Runtime {
  private manager: WorkerProcessManager;
  private bridge: ExecutionBridge;

  constructor(workerCount = 2) {
    this.manager = new WorkerProcessManager(workerCount);
    this.bridge = new ExecutionBridge(this.manager);
  }

  /**
   * Start full system
   */
  public start() {
    console.log('[Runtime] Starting system...');

    // 1. Start worker pool
    this.manager.start();

    // 2. Start execution bridge
    this.bridge.start(100);

    console.log('[Runtime] System fully active');
  }

  /**
   * Stop system
   */
  public stop() {
    console.log('[Runtime] Stopping system...');
    this.bridge.stop();
  }

  /**
   * System status snapshot
   */
  public status() {
    return {
      workers: this.manager.getStatus(),
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
