/**
 * workerProcess.ts (EVENT-AWARE ORCHESTRATION LAYER)
 * -------------------------------------------------
 * Updated to dispatch deterministic BaseEvents instead of jobs.
 */

import { fork } from 'child_process';
import path from 'path';

export type WorkerHandle = {
  id: string;
  process: ReturnType<typeof fork>;
  busy: boolean;
  eventsCompleted: number;
};

export type BaseEvent = {
  id: string;
  type: string;
  entityId: string;
  version: number;
  timestamp: number;
  causalChainId: string;
  payload: any;
};

export class WorkerProcessManager {
  private workers: Map<string, WorkerHandle> = new Map();

  constructor(private workerCount: number = 2) {}

  public start() {
    for (let i = 0; i < this.workerCount; i++) {
      this.spawnWorker(i);
    }
  }

  private spawnWorker(index: number) {
    const workerId = `worker-${index}`;

    const worker = fork(
      path.resolve(__dirname, './workerMain.js'),
      [],
      {
        stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
      }
    );

    const handle: WorkerHandle = {
      id: workerId,
      process: worker,
      busy: false,
      eventsCompleted: 0,
    };

    worker.on('message', (msg: any) => {
      if (msg?.type === 'worker_result') {
        handle.busy = false;
        handle.eventsCompleted++;
      }

      if (msg?.type === 'worker_heartbeat') {
        // health monitoring hook
      }
    });

    worker.on('exit', () => {
      this.workers.delete(workerId);
      this.spawnWorker(index);
    });

    this.workers.set(workerId, handle);
  }

  /**
   * Dispatch deterministic event (NOT job)
   */
  public dispatch(event: BaseEvent) {
    const worker = Array.from(this.workers.values()).find(w => !w.busy);

    if (!worker) {
      throw new Error('No available workers');
    }

    worker.busy = true;

    worker.process.send({
      type: 'event',
      payload: event,
    });
  }

  public getStatus() {
    return Array.from(this.workers.values()).map(w => ({
      id: w.id,
      busy: w.busy,
      eventsCompleted: w.eventsCompleted,
    }));
  }
}