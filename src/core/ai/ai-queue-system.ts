// Phase 9 Core Layer - AI Queue System
// Safety-first additive architecture (controls AI execution, prioritization, and context bundling)
// Sits on top of Sync Engine + Event Persistence + Memory Engine

export type AIJobPriority =
  | "low"
  | "normal"
  | "high"
  | "critical";

export type AIJobStatus = "queued" | "running" | "completed" | "failed";

export interface AIJob {
  id: string;
  type: "edit" | "generate" | "analyze" | "sync" | "reason";
  workspaceId: string;
  userId?: string;
  payload: any;
  priority: AIJobPriority;
  status: AIJobStatus;
  createdAt: number;
  retries?: number;
}

export interface AIContextBundle {
  workspaceId: string;
  memory?: any;
  recentEvents?: any[];
  syncState?: any;
  graphSnapshot?: any;
  timestamp: number;
}

export interface AIQueueAdapter {
  execute: (job: AIJob, context: AIContextBundle) => Promise<any>;
}

export class AIQueueSystem {
  private queue: AIJob[] = [];
  private running: boolean = false;

  constructor(private adapter?: AIQueueAdapter) {}

  enqueue(job: Omit<AIJob, "id" | "status" | "createdAt">) {
    const fullJob: AIJob = {
      id: `job_${Date.now()}_${Math.random()}`,
      status: "queued",
      createdAt: Date.now(),
      retries: 0,
      ...job,
    };

    this.queue.push(fullJob);
    this.sortQueue();
  }

  private sortQueue() {
    const priorityWeight: Record<AIJobPriority, number> = {
      critical: 3,
      high: 2,
      normal: 1,
      low: 0,
    };

    this.queue.sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);
  }

  async start() {
    if (this.running) return;
    this.running = true;

    while (this.running) {
      const job = this.queue.find(j => j.status === "queued");

      if (!job) {
        await this.sleep(200);
        continue;
      }

      job.status = "running";

      try {
        const context = await this.buildContext(job.workspaceId);

        if (this.adapter) {
          await this.adapter.execute(job, context);
        }

        job.status = "completed";
      } catch (err) {
        job.status = "failed";
        job.retries = (job.retries || 0) + 1;

        if (job.retries < 3) {
          job.status = "queued";
        }
      }
    }
  }

  stop() {
    this.running = false;
  }

  private async buildContext(workspaceId: string): Promise<AIContextBundle> {
    return {
      workspaceId,
      memory: null,
      recentEvents: [],
      syncState: null,
      graphSnapshot: null,
      timestamp: Date.now(),
    };
  }

  private sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getQueue() {
    return this.queue;
  }
}
