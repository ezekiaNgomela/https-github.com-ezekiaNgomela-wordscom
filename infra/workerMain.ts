/**
 * workerMain.ts (EVENT-SOURCED EXECUTION WORKER)
 * -------------------------------------------------
 * This worker now processes deterministic BaseEvents instead of ad-hoc jobs.
 * It becomes a pure execution unit in the event-sourced system.
 */

import { executionLedger } from './executionLedger';

type BaseEvent = {
  id: string;
  type: string;
  entityId: string;
  version: number;
  timestamp: number;
  causalChainId: string;
  payload: any;
};

type WorkerResult = {
  eventId: string;
  success: boolean;
  output?: any;
  error?: string;
};

const isChildProcess = typeof process.send === 'function';

/**
 * Deterministic event execution logic
 */
async function executeEvent(event: BaseEvent): Promise<WorkerResult> {
  try {
    const output = {
      processed: true,
      eventType: event.type,
      entityId: event.entityId,
      result: event.payload,
      timestamp: Date.now()
    };

    const result: WorkerResult = {
      eventId: event.id,
      success: true,
      output
    };

    // RECORD INTO EXECUTION LEDGER
    executionLedger.record({
      eventId: event.id,
      entityId: event.entityId,
      type: event.type,
      timestamp: Date.now(),
      success: true,
      output
    });

    return result;

  } catch (err: any) {
    const result: WorkerResult = {
      eventId: event.id,
      success: false,
      error: err?.message || 'Unknown error'
    };

    executionLedger.record({
      eventId: event.id,
      entityId: event.entityId,
      type: event.type,
      timestamp: Date.now(),
      success: false,
      error: result.error
    });

    return result;
  }
}

if (isChildProcess) {
  process.on('message', async (msg: any) => {
    if (!msg) return;

    if (msg.type !== 'event') return;

    const event = msg.payload as BaseEvent;

    const result = await executeEvent(event);

    process.send?.({
      type: 'worker_result',
      payload: result
    });
  });

  setInterval(() => {
    process.send?.({
      type: 'worker_heartbeat',
      payload: {
        status: 'alive',
        ts: Date.now()
      }
    });
  }, 5000);
}

export default executeEvent;