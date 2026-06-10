/**
 * controlLoop.binding.ts
 * -------------------------------------------------
 * Phase 6 Step 3
 *
 * This module connects system telemetry (EventBus)
 * to the control loop decision layer.
 *
 * Responsibilities:
 * - Listen to worker/job events
 * - Compute lightweight runtime metrics
 * - Prepare scaling signals (no enforcement yet)
 */

import { eventBus } from './eventBus';

/**
 * Runtime metrics snapshot
 */
type Metrics = {
  jobsProcessed: number;
  failures: number;
  avgThroughput: number;
  lastHeartbeat: number;
};

class ControlLoopBinding {
  private metrics: Metrics = {
    jobsProcessed: 0,
    failures: 0,
    avgThroughput: 0,
    lastHeartbeat: Date.now(),
  };

  private jobTimestamps: number[] = [];

  public start() {
    this.bindEvents();

    // periodic evaluation tick
    setInterval(() => this.evaluate(), 2000);
  }

  private bindEvents() {
    eventBus.on('job_result', (payload: any) => {
      this.metrics.jobsProcessed++;
      this.jobTimestamps.push(Date.now());
    });

    eventBus.on('worker_failed', () => {
      this.metrics.failures++;
    });

    eventBus.on('worker_heartbeat', () => {
      this.metrics.lastHeartbeat = Date.now();
    });
  }

  /**
   * Compute system health + scaling signal
   */
  private evaluate() {
    const now = Date.now();

    // keep only last 10 seconds of jobs
    this.jobTimestamps = this.jobTimestamps.filter(t => now - t < 10000);

    this.metrics.avgThroughput = this.jobTimestamps.length / 10;

    const failureRate = this.metrics.failures / Math.max(1, this.metrics.jobsProcessed);

    const signal = {
      throughput: this.metrics.avgThroughput,
      failureRate,
      status: failureRate > 0.2 ? 'unstable' : 'stable',
      suggestion:
        this.metrics.avgThroughput > 5
          ? 'scale_up'
          : this.metrics.avgThroughput < 1
          ? 'scale_down'
          : 'hold',
    };

    // emit computed system signal back into event system
    eventBus.emit('system_metrics', signal);
  }
}

export const controlLoopBinding = new ControlLoopBinding();
