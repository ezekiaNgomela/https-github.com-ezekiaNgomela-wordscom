/**
 * autoscaler.v3.ts
 * -------------------------------------------------
 * Phase 7 Step 3 (FINAL AUTONOMY WIRING)
 *
 * This module connects:
 * - controlLoop system_metrics
 * - WorkerProcessManagerV3 (real OS scaling)
 *
 * Result: fully autonomous scaling loop
 */

import { eventBus } from './eventBus';
import { WorkerProcessManagerV3 } from './workerProcess.v3';

export class AutoScalerV3 {
  private manager: WorkerProcessManagerV3;
  private minWorkers: number;
  private maxWorkers: number;

  constructor(manager: WorkerProcessManagerV3, min = 2, max = 6) {
    this.manager = manager;
    this.minWorkers = min;
    this.maxWorkers = max;
  }

  /**
   * Activate autonomous scaling loop
   */
  public start() {
    eventBus.on('system_metrics', (signal: any) => {
      this.evaluate(signal);
    });
  }

  /**
   * Decision engine → ACTUATION (real scaling)
   */
  private evaluate(signal: any) {
    const status = this.manager.getStatus();
    const currentWorkers = status.length;

    const { throughput, failureRate, suggestion } = signal;

    // HARD SAFETY RULE: high failure rate → reduce load immediately
    if (failureRate > 0.4 && currentWorkers > this.minWorkers) {
      console.log('[AutoScalerV3] Safety SCALE DOWN triggered');
      this.manager.removeWorker();
      return;
    }

    // SCALE UP condition
    if (
      suggestion === 'scale_up' &&
      currentWorkers < this.maxWorkers
    ) {
      console.log('[AutoScalerV3] Scaling UP');
      this.manager.spawnWorkerDynamic();
      return;
    }

    // SCALE DOWN condition
    if (
      suggestion === 'scale_down' &&
      currentWorkers > this.minWorkers
    ) {
      console.log('[AutoScalerV3] Scaling DOWN');
      this.manager.removeWorker();
      return;
    }

    // HOLD → no action
  }

  /**
   * Debug status
   */
  public status() {
    return {
      workers: this.manager.getStatus().length,
      min: this.minWorkers,
      max: this.maxWorkers,
    };
  }
}
