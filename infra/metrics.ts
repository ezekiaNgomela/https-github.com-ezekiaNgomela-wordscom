/**
 * metrics.ts
 * -------------------------------------------------
 * Phase 9: Production Observability Instrumentation
 *
 * Exposes Prometheus-compatible metrics for:
 * - job processing
 * - worker utilization
 * - failure rates
 * - autoscaling actions
 */

import client from 'prom-client';

// Default registry
export const register = new client.Registry();

client.collectDefaultMetrics({ register });

/**
 * Job metrics
 */
export const jobsProcessed = new client.Counter({
  name: 'wordscom_jobs_processed_total',
  help: 'Total number of jobs processed',
});

export const jobFailures = new client.Counter({
  name: 'wordscom_job_failures_total',
  help: 'Total number of failed jobs',
});

/**
 * Worker metrics
 */
export const activeWorkers = new client.Gauge({
  name: 'wordscom_active_workers',
  help: 'Number of active worker processes',
});

export const workerUtilization = new client.Gauge({
  name: 'wordscom_worker_utilization',
  help: 'Worker utilization ratio',
});

/**
 * Autoscaling metrics
 */
export const scalingEvents = new client.Counter({
  name: 'wordscom_scaling_events_total',
  help: 'Total autoscaling events triggered',
  labelNames: ['direction'], // up | down
});

/**
 * Register all metrics
 */
register.registerMetric(jobsProcessed);
register.registerMetric(jobFailures);
register.registerMetric(activeWorkers);
register.registerMetric(workerUtilization);
register.registerMetric(scalingEvents);

/**
 * Export metrics endpoint payload
 */
export async function getMetrics(): Promise<string> {
  return register.metrics();
}
