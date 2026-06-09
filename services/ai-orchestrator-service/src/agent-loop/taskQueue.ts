export type TaskType = "user_request" | "workflow_resume" | "scheduled_job" | "system_event";

export type Task = {
  id: string;
  type: TaskType;
  payload: any;
  priority: number;
  createdAt: number;
  status: "pending" | "processing" | "done" | "failed";
};

const queue: Task[] = [];

export function addTask(task: Task) {
  queue.push(task);
  return task;
}

export function getNextTask(): Task | undefined {
  const sorted = queue
    .filter(t => t.status === "pending")
    .sort((a, b) => b.priority - a.priority);

  return sorted[0];
}

export function markTask(taskId: string, status: Task["status"]) {
  const task = queue.find(t => t.id === taskId);
  if (!task) return;
  task.status = status;
}

export function listTasks() {
  return queue;
}