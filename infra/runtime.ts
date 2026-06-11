/**
 * runtime.ts
 * -------------------------------------------------
 * Unified system entrypoint (Phase 4)
 * Refactored to align with Event-Sourced Execution Model
 */

import { WorkerProcessManager } from './workerProcess';

/**
 * System Runtime Bootstrap
 */
export class Runtime {
  private manager: WorkerProcessManager;

  constructor(workerCount = 2) {
    this.manager = new WorkerProcessManager(workerCount);
  }

  /**
   * Start full system
   */
  public start() {
    console.log('[Runtime] Starting system (event-sourced mode)...');

    // Start worker pool only
    this.manager.start();

    console.log('[Runtime] Workers active');
  }

  /**
   * Stop system
   */
  public stop() {
    console.log('[Runtime] Stopping system...');
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