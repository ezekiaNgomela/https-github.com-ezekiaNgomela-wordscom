/**
 * PHASE 12: PATTERN LEARNER
 * Detects recurring system behaviors from telemetry
 */

import { getTelemetry } from "./telemetryStore";

export type Pattern = {
  type: string;
  confidence: number;
  frequency: number;
};

export function learnPatterns(): Pattern[] {
  const data = getTelemetry();

  const patterns: Pattern[] = [];

  if (data.length < 5) return patterns;

  const avgLoad = data.reduce((s, r) => s + r.metrics.queueDepth, 0) / data.length;

  if (avgLoad > 30) {
    patterns.push({
      type: "high_load_trend",
      confidence: 0.8,
      frequency: avgLoad
    });
  }

  const failureTrend = data.reduce((s, r) => s + r.metrics.failureRate, 0) / data.length;

  if (failureTrend > 0.15) {
    patterns.push({
      type: "instability_trend",
      confidence: 0.75,
      frequency: failureTrend
    });
  }

  return patterns;
}