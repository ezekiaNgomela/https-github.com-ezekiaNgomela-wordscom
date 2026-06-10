/**
 * executionBridge.ts
 * -------------------------------------------------
 * Phase 3 integration layer
 * Bridges:
 * - in-memory queue system
 * - WorkerProcessManager (multi-process execution)
 *
 * This is the missing link that turns orchestration
 * into real execution flow.
 */

import { WorkerProcessManager, JobPayload } from './workerProcess';
import { queue } from './queue'; // assumed existing in infra/queue.ts

export class ExecutionBridge {
  private running = false;

  constructor(private manager: WorkerProcessManager) {}

  /**
   * Start execution loop
   */
  public start(pollInterval = 100) {
    if (this.running) return;
    this.running = true;

    setInterval(() => this.tick(), pollInterval);
  }

  /**
   * Core bridge tick
   */
  private tick() {
    try {
      const job = queue.dequeue?.();

      if (!job) return;

      const payload: JobPayload = {
        id: job.id,
        type: job.type || 'default',
        data: job.data,
      };

      try {
        this.manager.dispatch(payload);
      } catch (err) {
        // If no workers available, requeue job
        queue.enqueue?.(job);
      }
    } catch (err) {
      // silent failure protection for bridge stability
      console.error('[ExecutionBridge] tick error:', err);
    }
  }

  /**
   * Graceful shutdown hook
   */
  public stop() {
    this.running = false;
  }
}
