/**
 * infra/chaos/chaosRunner.ts
 * -------------------------------------------------
 * Phase 24: Chaos Runner (Execution + Evaluation Layer)
 *
 * This module turns ChaosHarness (failure injection)
 * into a fully automated resilience validation system.
 *
 * Responsibilities:
 * 1. Schedule chaos scenarios
 * 2. Execute harness
 * 3. Collect system signals via eventBus
 * 4. Evaluate SLO + stability thresholds
 * 5. Produce pass/fail resilience report
 */

import { ChaosHarness, ChaosScenario } from './chaosHarness';
import { eventBus } from '../eventBus';

export interface ChaosMetrics {
  jobFailures: number;
  jobDuplicates: number;
  avgLatencyMs: number;
  queueDepthMax: number;
  recoveryTimeMs: number;
}

export interface ChaosReport {
  scenario: string;
  passed: boolean;
  metrics: ChaosMetrics;
  violations: string[];
}

export class ChaosRunner {
  private harness: ChaosHarness;
  private metrics: ChaosMetrics;
  private startTime: number = 0;
  private violations: string[] = [];

  constructor(harness: ChaosHarness) {
    this.harness = harness;

    this.metrics = {
      jobFailures: 0,
      jobDuplicates: 0,
      avgLatencyMs: 0,
      queueDepthMax: 0,
      recoveryTimeMs: 0,
    };

    this.bindEventCollectors();
  }

  /** Attach system-wide observers */
  private bindEventCollectors() {
    eventBus.on('job_failed', () => this.metrics.jobFailures++);
    eventBus.on('job_duplicate', () => this.metrics.jobDuplicates++);
    eventBus.on('latency_sample', (d: any) => {
      this.metrics.avgLatencyMs = (this.metrics.avgLatencyMs + d.ms) / 2;
    });
    eventBus.on('queue_depth', (d: any) => {
      this.metrics.queueDepthMax = Math.max(this.metrics.queueDepthMax, d.depth);
    });
  }

  /** Run full chaos scenario set */
  public async run(scenarios: ChaosScenario[]): Promise<ChaosReport[]> {
    const reports: ChaosReport[] = [];

    for (const scenario of scenarios) {
      this.reset();
      this.startTime = Date.now();

      this.harness.addScenario(scenario);
      this.harness.start();

      await this.sleep(scenario.durationMs + 2000);

      this.harness.stop();

      const report = this.evaluate(scenario);
      reports.push(report);
    }

    return reports;
  }

  /** Evaluate system stability after chaos run */
  private evaluate(s: ChaosScenario): ChaosReport {
    const recoveryTime = Date.now() - this.startTime;
    this.metrics.recoveryTimeMs = recoveryTime;

    this.violations = [];

    // SLO rules
    if (this.metrics.jobDuplicates > 0)
      this.violations.push('DUPLICATE_EXECUTION');

    if (this.metrics.jobFailures > 5)
      this.violations.push('HIGH_FAILURE_RATE');

    if (this.metrics.avgLatencyMs > 1000)
      this.violations.push('LATENCY_SLO_BREACH');

    if (this.metrics.queueDepthMax > 500)
      this.violations.push('QUEUE_OVERFLOW');

    if (this.metrics.recoveryTimeMs > 15000)
      this.violations.push('SLOW_RECOVERY');

    const passed = this.violations.length === 0;

    eventBus.emit('chaos_report', {
      scenario: s.name,
      passed,
      metrics: this.metrics,
    });

    return {
      scenario: s.name,
      passed,
      metrics: this.metrics,
      violations: this.violations,
    };
  }

  /** Reset metrics between runs */
  private reset() {
    this.metrics = {
      jobFailures: 0,
      jobDuplicates: 0,
      avgLatencyMs: 0,
      queueDepthMax: 0,
      recoveryTimeMs: 0,
    };
    this.violations = [];
  }

  private sleep(ms: number) {
    return new Promise(res => setTimeout(res, ms));
  }
}
