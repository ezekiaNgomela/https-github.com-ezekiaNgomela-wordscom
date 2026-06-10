import { queue } from "./queue";
import { scaleWorkers, getActiveWorkers } from "./agentSpawner";

/**
 * Phase 18: Control Loop Orchestration Bridge
 * ------------------------------------------
 * Connects system load → worker scaling decisions.
 * This is the missing "nervous system" between:
 * - Queue (demand)
 * - Spawner (supply)
 */

let running = false;

export function startControlLoop(intervalMs: number = 1000) {
  if (running) return;
  running = true;

  setInterval(() => {
    const load = queue.size();
    const active = getActiveWorkers().length;

    // Simple adaptive scaling heuristic
    let target = 1;

    if (load > 20) target = 5;
    else if (load > 10) target = 3;
    else if (load > 0) target = 2;

    // prevent runaway scaling
    target = Math.min(target, 10);

    if (target !== active) {
      scaleWorkers(target);
    }
  }, intervalMs);
}