/**
 * autoscaler.ts
 * -------------------------------------------------
 * Phase 7: Autonomous Scaling Engine
 *
 * This module turns system_metrics signals into
 * actual worker scaling actions.
 *
 * Responsibilities:
 * - Listen to controlLoop system_metrics
 * - Decide scale up / scale down actions
 * - Execute WorkerProcessManager scaling
 */

import { eventBus } from './eventBus';
import { WorkerProcessManagerV2 } from './workerProcess.v2';

export class AutoScaler {
  private manager: WorkerProcessManagerV2;
  private minWorkers: number;
  private maxWorkers: number;

  private currentWorkers: number;

  constructor(manager: WorkerProcessManagerV2, min = 2, max = 6) {
    this.manager = manager;
    this.minWorkers = min;
    this.maxWorkers = max;
    this.currentWorkers = min;
  }

  /**
   * Start listening to system metrics
   */
  public start() {
    eventBus.on('system_metrics', (signal: any) => {
      this.evaluate(signal);
    });
  }

  /**
   * Scaling decision engine
   */
  private evaluate(signal: any) {
    const { throughput, failureRate, suggestion } = signal;

    // Safety override: high failure rate → scale down cautiously
    if (failureRate > 0.4) {
      this.scaleDown();
      return;
    }

    if (suggestion === 'scale_up' && this.currentWorkers < this.maxWorkers) {
      this.scaleUp();
      return;
    }

    if (suggestion === 'scale_down' && this.currentWorkers > this.minWorkers) {
      this.scaleDown();
      return;
    }

    // stable → no action
  }

  /**
   * Increase worker pool
   */
  private scaleUp() {
    this.currentWorkers++;

    // NOTE: placeholder hook
    // In full implementation, manager.spawnWorkerDynamic() would be used
    console.log(`[AutoScaler] Scaling UP → workers = ${this.currentWorkers}`);
  }

  /**
   * Decrease worker pool
   */
  private scaleDown() {
    this.currentWorkers = Math.max(this.minWorkers, this.currentWorkers - 1);

    console.log(`[AutoScaler] Scaling DOWN → workers = ${this.currentWorkers}`);
  }

  /**
   * Status
   */
  public status() {
    return {
      workers: this.currentWorkers,
      min: this.minWorkers,
      max: this.maxWorkers,
    };
  }
}
