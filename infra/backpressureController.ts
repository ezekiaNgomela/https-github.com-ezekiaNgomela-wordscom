/**
 * backpressureController.ts
 * -------------------------------------------------
 * Phase 11: Backpressure Control System
 *
 * Prevents worker overload by dynamically throttling event consumption.
 */

export type BackpressureSnapshot = {
  inFlight: number;
  capacity: number;
  utilization: number;
};

export class BackpressureController {
  private maxCapacity: number;

  constructor(maxCapacity: number) {
    this.maxCapacity = maxCapacity;
  }

  /**
   * Decide whether system should pause consumption
   */
  shouldPause(inFlight: number): boolean {
    return inFlight >= this.maxCapacity;
  }

  /**
   * Compute safe batch size based on load
   */
  getBatchSize(inFlight: number): number {
    const remaining = this.maxCapacity - inFlight;

    if (remaining <= 0) return 0;
    if (remaining < 5) return 1;
    if (remaining < 10) return 5;

    return Math.min(10, remaining);
  }

  /**
   * Build snapshot for observability
   */
  snapshot(inFlight: number): BackpressureSnapshot {
    return {
      inFlight,
      capacity: this.maxCapacity,
      utilization: inFlight / this.maxCapacity,
    };
  }
}