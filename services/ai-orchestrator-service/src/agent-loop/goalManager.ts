export type Goal = {
  id: string;
  description: string;
  status: "active" | "completed" | "paused";
  createdAt: number;
  metadata?: any;
};

const goals: Goal[] = [];

export function createGoal(goal: Goal) {
  goals.push(goal);
  return goal;
}

export function listGoals() {
  return goals;
}

export function updateGoal(goalId: string, patch: Partial<Goal>) {
  const goal = goals.find(g => g.id === goalId);
  if (!goal) return;

  Object.assign(goal, patch);
  return goal;
}

export function getActiveGoals() {
  return goals.filter(g => g.status === "active");
}