/**
 * workerMain.ts (EVENT-SOURCED EXECUTION WORKER)
 * -------------------------------------------------
 * This worker now processes deterministic BaseEvents instead of ad-hoc jobs.
 * It becomes a pure execution unit in the event-sourced system.
 */

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
    // PURE EXECUTION LOGIC (no side effects outside result)
    const output = {
      processed: true,
      eventType: event.type,
      entityId: event.entityId,
      result: event.payload,
      timestamp: Date.now()
    };

    return {
      eventId: event.id,
      success: true,
      output
    };

  } catch (err: any) {
    return {
      eventId: event.id,
      success: false,
      error: err?.message || 'Unknown error'
    };
  }
}

if (isChildProcess) {
  process.on('message', async (msg: any) => {
    if (!msg) return;

    // NEW: event-driven execution model
    if (msg.type !== 'event') return;

    const event = msg.payload as BaseEvent;

    const result = await executeEvent(event);

    process.send?.({
      type: 'worker_result',
      payload: result
    });
  });

  // lightweight heartbeat
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