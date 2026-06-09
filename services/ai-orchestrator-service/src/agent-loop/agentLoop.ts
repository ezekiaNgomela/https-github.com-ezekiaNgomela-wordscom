import { getNextTask, markTask } from "./taskQueue";
import { emit } from "./eventBus";
import { createLLMPlan } from "../agent/llmPlanner";
import { executePlan } from "../agent/executor";
import { aggregateResults } from "../agent/runtime";

let running = false;

export async function startAgentLoop() {
  running = true;

  while (running) {
    const task = getNextTask();

    if (!task) {
      await sleep(500);
      continue;
    }

    try {
      markTask(task.id, "processing");

      emit({
        id: `evt-${Date.now()}`,
        type: "task_created",
        payload: task,
        createdAt: Date.now()
      });

      const plan = await createLLMPlan(task.payload, task.id);

      const results = await executePlan(plan);
      const aggregated = aggregateResults(results);

      markTask(task.id, "done");

      emit({
        id: `evt-${Date.now()}`,
        type: "task_completed",
        payload: aggregated,
        createdAt: Date.now()
      });

    } catch (err: any) {
      markTask(task.id, "failed");

      emit({
        id: `evt-${Date.now()}`,
        type: "task_failed",
        payload: { error: err.message },
        createdAt: Date.now()
      });
    }
  }
}

export function stopAgentLoop() {
  running = false;
}

function sleep(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}