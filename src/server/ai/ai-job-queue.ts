// Phase 24.1 - AI Job Queue System (Production Scaling Layer)
// Handles batching, streaming control, and context injection for LLM tasks
// Sits on top of EventQueue for AI-specific execution guarantees

export type AIJobType = "completion" | "embedding" | "analysis";

export interface AIJob {
  id: string;
  type: AIJobType;
  userId: string;
  workspaceId: string;
  documentId?: string;
  prompt: string;
  context?: any;
  attempts: number;
  createdAt: number;
}

export class AIJobQueue {
  private queue: AIJob[] = [];
  private running = false;

  enqueue(job: Omit<AIJob, "attempts" | "createdAt">) {
    this.queue.push({
      ...job,
      attempts: 0,
      createdAt: Date.now(),
    });
  }

  async process(handler: (job: AIJob) => Promise<any>) {
    if (this.running) return;
    this.running = true;

    while (this.queue.length > 0) {
      const job = this.queue.shift();
      if (!job) continue;

      try {
        await handler(job);
      } catch (err) {
        job.attempts++;

        // retry with backoff limit
        if (job.attempts < 3) {
          this.queue.push(job);
        }
      }
    }

    this.running = false;
  }

  size() {
    return this.queue.length;
  }
}
