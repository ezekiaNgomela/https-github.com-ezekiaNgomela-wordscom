/**
 * infra/chaos/chaosHarness.ts
 * -------------------------------------------------
 * Phase 23: Chaos Engineering Harness
 *
 * Purpose:
 * Provides controlled failure injection for testing
 * distributed resilience behavior across the platform.
 *
 * This module does NOT execute real infra failures by itself.
 * Instead it exposes hooks that your runtime/control plane
 * can subscribe to and simulate failure conditions safely.
 */

import { eventBus } from '../eventBus';

export type ChaosEvent =
  | 'NODE_FAILURE'
  | 'NETWORK_LATENCY'
  | 'NETWORK_PARTITION'
  | 'REDIS_DELAY'
  | 'QUEUE_OVERLOAD'
  | 'CLOCK_DRIFT'
  | 'CPU_SPIKE';

export interface ChaosScenario {
  name: string;
  type: ChaosEvent;
  intensity: number; // 0 - 1
  durationMs: number;
}

export class ChaosHarness {
  private active = false;
  private scenarios: ChaosScenario[] = [];

  /** Register chaos scenario */
  public addScenario(scenario: ChaosScenario) {
    this.scenarios.push(scenario);
  }

  /** Start chaos execution loop */
  public start() {
    if (this.active) return;
    this.active = true;

    eventBus.emit('chaos_started', { timestamp: Date.now() });

    this.scenarios.forEach((scenario) => {
      this.runScenario(scenario);
    });
  }

  /** Stop all chaos activity */
  public stop() {
    this.active = false;
    eventBus.emit('chaos_stopped', { timestamp: Date.now() });
  }

  /** Core scenario executor */
  private runScenario(s: ChaosScenario) {
    if (!this.active) return;

    eventBus.emit('chaos_scenario_start', s);

    const timer = setTimeout(() => {
      if (!this.active) return;

      eventBus.emit('chaos_event', {
        type: s.type,
        intensity: s.intensity,
        timestamp: Date.now(),
      });

      this.applyEffect(s);

      eventBus.emit('chaos_scenario_end', s);
    }, s.durationMs);

    // Safety auto-cleanup if stopped early
    if (!this.active) clearTimeout(timer);
  }

  /**
   * Translates chaos event into system signals
   */
  private applyEffect(s: ChaosScenario) {
    switch (s.type) {
      case 'NODE_FAILURE':
        eventBus.emit('inject_node_failure', {
          severity: s.intensity,
        });
        break;

      case 'NETWORK_LATENCY':
        eventBus.emit('inject_latency', {
          ms: 100 + s.intensity * 2000,
        });
        break;

      case 'NETWORK_PARTITION':
        eventBus.emit('inject_partition', {
          splitRatio: s.intensity,
        });
        break;

      case 'REDIS_DELAY':
        eventBus.emit('inject_redis_latency', {
          delayMs: 50 + s.intensity * 1000,
        });
        break;

      case 'QUEUE_OVERLOAD':
        eventBus.emit('inject_queue_backpressure', {
          multiplier: 1 + s.intensity * 10,
        });
        break;

      case 'CLOCK_DRIFT':
        eventBus.emit('inject_clock_drift', {
          driftMs: s.intensity * 5000,
        });
        break;

      case 'CPU_SPIKE':
        eventBus.emit('inject_cpu_load', {
          load: s.intensity,
        });
        break;
    }
  }

  /** Prebuilt production chaos profiles */
  public static presets() {
    return {
      light: [
        { name: 'latency-test', type: 'NETWORK_LATENCY', intensity: 0.2, durationMs: 5000 },
      ],
      medium: [
        { name: 'queue-stress', type: 'QUEUE_OVERLOAD', intensity: 0.5, durationMs: 10000 },
        { name: 'redis-delay', type: 'REDIS_DELAY', intensity: 0.4, durationMs: 8000 },
      ],
      severe: [
        { name: 'partition-test', type: 'NETWORK_PARTITION', intensity: 0.7, durationMs: 12000 },
        { name: 'node-loss', type: 'NODE_FAILURE', intensity: 0.6, durationMs: 10000 },
      ],
    };
  }

  /** Utility: inject preset scenario set */
  public loadPreset(level: 'light' | 'medium' | 'severe') {
    const preset = ChaosHarness.presets()[level];
    preset.forEach((p) => this.addScenario(p));
  }

  /** Current state */
  public status() {
    return {
      active: this.active,
      scenarios: this.scenarios.length,
    };
  }
}
