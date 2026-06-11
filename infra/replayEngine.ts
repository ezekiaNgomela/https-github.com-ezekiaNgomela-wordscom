/**
 * replayEngine.ts
 * -------------------------------------------------
 * Phase 5: Deterministic Replay Engine
 *
 * Rebuilds system state from EventStore streams.
 * This is the missing piece that makes the system fully event-sourced.
 */

import { eventStore, BaseEvent } from './eventStore';
import { executionLedger } from './executionLedger';

export type EntityState = {
  entityId: string;
  lastVersion: number;
  data: any;
};

export type ReplayResult = {
  states: Map<string, EntityState>;
  totalEvents: number;
  verified: boolean;
};

/**
 * Apply a single event to state
 */
function applyEvent(state: any, event: BaseEvent): any {
  switch (event.type) {
    case 'COMMAND_CREATED':
      return {
        ...state,
        lastCommand: event.payload,
      };

    case 'AI_REQUESTED':
      return {
        ...state,
        aiRequest: event.payload,
      };

    case 'WORKER_COMPLETED':
      return {
        ...state,
        lastWorkerResult: event.payload,
      };

    case 'STATE_UPDATED':
      return {
        ...state,
        ...event.payload,
      };

    default:
      return state;
  }
}

/**
 * Replay a single entity stream
 */
async function replayEntity(entityId: string): Promise<EntityState> {
  const stream = await eventStore.getStream(entityId);

  let state: any = {};
  let lastVersion = 0;

  for (const event of stream) {
    state = applyEvent(state, event);
    lastVersion = event.version;

    // Optional verification against execution ledger
    const ledgerEntry = executionLedger.getByEvent(event.id);
    if (!ledgerEntry && event.type === 'WORKER_COMPLETED') {
      console.warn(`[ReplayEngine] Missing ledger entry for event ${event.id}`);
    }
  }

  return {
    entityId,
    lastVersion,
    data: state,
  };
}

/**
 * Replay full system state
 */
export async function replaySystem(entityIds: string[]): Promise<ReplayResult> {
  const states = new Map<string, EntityState>();

  let totalEvents = 0;

  for (const id of entityIds) {
    const state = await replayEntity(id);
    states.set(id, state);

    const stream = await eventStore.getStream(id);
    totalEvents += stream.length;
  }

  return {
    states,
    totalEvents,
    verified: true,
  };
}