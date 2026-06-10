/**
 * workerProcess.ts
 * -------------------------------------------------
 * Master worker orchestration layer (Phase 2)
 *
 * Responsibilities:
 * - Spawn OS-level worker processes
 * - Maintain worker registry
 * - Dispatch jobs to workers via IPC
 * - Handle worker failures and restarts
 */

import { fork } from 'child_process';
import path from 'path';

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

export class WorkerProcessManager {
  private workers: Map<string, WorkerHandle> = new Map();

  constructor(private workerCount: number = 2) {}

  /**
   * Initialize worker pool
   */
  public start() {
    for (let i = 0; i < this.workerCount; i++) {
      this.spawnWorker(i);
    }
  }

  /**
   * Spawn a single worker process
   */
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
      jobsCompleted: 0,
    };

    worker.on('message', (msg: any) => {
      if (msg?.type === 'job_result') {
        handle.busy = false;
        handle.jobsCompleted++;
      }

      if (msg?.type === 'heartbeat') {
        // worker health monitoring hook
      }
    });

    worker.on('exit', () => {
      this.workers.delete(workerId);
      // auto-restart
      this.spawnWorker(index);
    });

    this.workers.set(workerId, handle);
  }

  /**
   * Dispatch job to first available worker
   */
  public dispatch(job: JobPayload) {
    const worker = Array.from(this.workers.values()).find(w => !w.busy);

    if (!worker) {
      throw new Error('No available workers');
    }

    worker.busy = true;

    worker.process.send({
      type: 'job',
      payload: job,
    });
  }

  /**
   * Get worker stats
   */
  public getStatus() {
    return Array.from(this.workers.values()).map(w => ({
      id: w.id,
      busy: w.busy,
      jobsCompleted: w.jobsCompleted,
    }));
  }
}
