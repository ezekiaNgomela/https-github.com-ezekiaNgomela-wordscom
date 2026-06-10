/**
 * telemetry.ts
 * -------------------------------------------------
 * Phase 9: OpenTelemetry setup
 * Enables distributed tracing across:
 * - runtime controller
 * - workers
 * - execution bridge
 */

import { NodeSDK } from '@opentelemetry/sdk-node';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'wordscom-runtime',
  }),
  traceExporter: new ConsoleSpanExporter(),
  instrumentations: [getNodeAutoInstrumentations()],
});

export function startTelemetry() {
  sdk.start();
  console.log('[Telemetry] OpenTelemetry started');
}

export async function stopTelemetry() {
  await sdk.shutdown();
}
