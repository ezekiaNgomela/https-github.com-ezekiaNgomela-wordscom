/**
 * PHASE 12: TELEMETRY STORE
 * Persistent memory of system behavior for learning loop
 */

export type TelemetryRecord = {
  timestamp: number;
  metrics: any;
  action: any;
  outcomeScore: number; // -1 to 1 (performance quality)
};

const telemetry: TelemetryRecord[] = [];

export function recordTelemetry(record: TelemetryRecord) {
  telemetry.push(record);
}

export function getTelemetry() {
  return telemetry;
}

export function getRecentTelemetry(limit: number = 50) {
  return telemetry.slice(-limit);
}

export function clearTelemetry() {
  telemetry.length = 0;
}
