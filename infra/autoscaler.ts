/**
 * autoscaler.ts
 * -------------------------------------------------
 * Phase 7: Autonomous Scaling Engine
 * Refactored to remove EventBus dependency
 */

import { WorkerProcessManager } from './workerProcess';

export class AutoScaler {
  private manager: WorkerProcessManager;
  private minWorkers: number;
  private maxWorkers: number;
  private currentWorkers: number;

  constructor(manager: WorkerProcessManager, min = 2, max = 6) {
    this.manager = manager;
    this.minWorkers = min;
    this.maxWorkers = max;
    this.currentWorkers = min;
  }

  /**
   * Evaluate system metrics (external feed)
   */
  public evaluate(signal: any) {
    const { throughput, failureRate, suggestion } = signal;

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
  }

  private scaleUp() {
    this.currentWorkers++;
    console.log(`[AutoScaler] Scaling UP → workers = ${this.currentWorkers}`);
  }

  private scaleDown() {
    this.currentWorkers = Math.max(this.minWorkers, this.currentWorkers - 1);
    console.log(`[AutoScaler] Scaling DOWN → workers = ${this.currentWorkers}`);
  }

  public status() {
    return {
      workers: this.currentWorkers,
      min: this.minWorkers,
      max: this.maxWorkers,
    };
  }
}