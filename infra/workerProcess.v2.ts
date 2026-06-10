/**
 * workerProcess.v2.ts
 * -------------------------------------------------
 * Event-driven WorkerProcessManager (Phase 6 patched version)
 *
 * NOTE:
 * This is a safe upgrade version that includes EventBus wiring
 * without modifying existing stable runtime files.
 */

import { fork } from 'child_process';
import path from 'path';
import { eventBus } from './eventBus';

export type WorkerHandle = {
  id: string;
  process: ReturnType<typeof fork>;
  busy: boolean;
  jobsCompleted: number;
};

export type JobPayload = {
  id: string;
  type: string;
  data: any;
};

export class WorkerProcessManagerV2 {
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
      { stdio: ['pipe', 'pipe', 'pipe', 'ipc'] }
    );

    const handle: WorkerHandle = {
      id: workerId,
      process: worker,
      busy: false,
      jobsCompleted: 0,
    };

    eventBus.emit('worker_spawned', {
      workerId,
      timestamp: Date.now(),
    });

    worker.on('message', (msg: any) => {
      if (!msg) return;

      if (msg.type === 'job_result') {
        handle.busy = false;
        handle.jobsCompleted++;

        eventBus.emit('job_result', {
          workerId,
          payload: msg.payload,
        });
      }

      if (msg.type === 'heartbeat') {
        eventBus.emit('worker_heartbeat', {
          workerId,
          payload: msg.payload,
        });
      }
    });

    worker.on('exit', (code) => {
      this.workers.delete(workerId);

      eventBus.emit('worker_failed', {
        workerId,
        code,
        timestamp: Date.now(),
      });

      this.spawnWorker(index);
    });

    this.workers.set(workerId, handle);
  }

  public dispatch(job: JobPayload) {
    const worker = Array.from(this.workers.values()).find(w => !w.busy);

    if (!worker) throw new Error('No available workers');

    worker.busy = true;

    worker.process.send({ type: 'job', payload: job });
  }

  public getStatus() {
    return Array.from(this.workers.values()).map(w => ({
      id: w.id,
      busy: w.busy,
      jobsCompleted: w.jobsCompleted,
    }));
  }
}
