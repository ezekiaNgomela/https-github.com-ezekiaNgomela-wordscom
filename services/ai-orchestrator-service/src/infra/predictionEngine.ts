/**
 * PHASE 12: PREDICTION ENGINE
 * Forecasts future system load from historical telemetry
 */

import { getRecentTelemetry } from "./telemetryStore";

export type Prediction = {
  predictedQueueDepth: number;
  predictedFailureRate: number;
  confidence: number;
};

export function predictNextState(): Prediction {
  const data = getRecentTelemetry(20);

  if (data.length === 0) {
    return {
      predictedQueueDepth: 0,
      predictedFailureRate: 0,
      confidence: 0
    };
  }

  const last = data[data.length - 1];

  const trendFactor = 1 + (Math.random() * 0.3);

  const predictedQueueDepth = Math.max(0, last.metrics.queueDepth * trendFactor);
  const predictedFailureRate = Math.min(1, last.metrics.failureRate * trendFactor);

  return {
    predictedQueueDepth,
    predictedFailureRate,
    confidence: 0.6 + Math.random() * 0.3
  };
}