/**
 * workerProcess.v3.ts
 * -------------------------------------------------
 * Phase 7 Step 2
 * Dynamic scaling-enabled WorkerProcessManager
 *
 * Extends V2 with runtime worker pool mutation:
 * - spawnWorkerDynamic()
 * - removeWorker()
 * - scaling-safe registry updates
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

export class WorkerProcessManagerV3 {
  private workers: Map<string, WorkerHandle> = new Map();
  private index = 0;

  constructor(private workerCount: number = 2) {}

  public start() {
    for (let i = 0; i < this.workerCount; i++) {
      this.spawnWorker(i);
    }
  }

  /**
   * Base spawn (initial boot)
   */
  private spawnWorker(index: number) {
    const workerId = `worker-${index}`;

    const worker = fork(
      path.resolve(__dirname, './workerMain.js'),
      [],
      { stdio: ['pipe', 'pipe', 'pipe', 'ipc'] }
    );

    this.attachWorker(workerId, worker);
  }

  /**
   * Dynamic runtime scaling spawn
   */
  public spawnWorkerDynamic() {
    const workerId = `worker-dyn-${this.index++}`;

    const worker = fork(
      path.resolve(__dirname, './workerMain.js'),
      [],
      { stdio: ['pipe', 'pipe', 'pipe', 'ipc'] }
    );

    this.attachWorker(workerId, worker);

    eventBus.emit('worker_spawned', {
      workerId,
      dynamic: true,
      timestamp: Date.now(),
    });
  }

  /**
   * Remove a worker safely
   */
  public removeWorker() {
    const entry = this.workers.entries().next().value;
    if (!entry) return;

    const [workerId, handle] = entry;

    handle.process.kill();
    this.workers.delete(workerId);

    eventBus.emit('worker_failed', {
      workerId,
      reason: 'scaling_down',
      timestamp: Date.now(),
    });
  }

  /**
   * Shared worker wiring logic
   */
  private attachWorker(workerId: string, worker: ReturnType<typeof fork>) {
    const handle: WorkerHandle = {
      id: workerId,
      process: worker,
      busy: false,
      jobsCompleted: 0,
    };

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
