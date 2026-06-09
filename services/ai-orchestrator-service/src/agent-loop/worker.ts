import { startAgentLoop } from "./agentLoop";
import { addTask } from "./taskQueue";
import { createGoal } from "./goalManager";

export function startWorker() {
  // bootstrap system goals
  createGoal({
    id: "system-goal-1",
    description: "Process incoming user and system tasks",
    status: "active",
    createdAt: Date.now()
  });

  // sample bootstrap task (can be removed in prod)
  addTask({
    id: "boot-task",
    type: "system_event",
    payload: "initialize",
    priority: 1,
    createdAt: Date.now(),
    status: "pending"
  });

  startAgentLoop();
}