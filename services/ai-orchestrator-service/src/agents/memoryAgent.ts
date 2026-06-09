import { publish } from "../core/messageBus";
import { registerAgent } from "../core/agentRegistry";
import { loadMemoryContext } from "../memory/memoryLoader";
import { writeToolResult, writeWorkflowNote } from "../memory/memoryWriter";

const agent = registerAgent({
  id: "memory-agent-1",
  type: "memory",
  status: "idle",
  metadata: { version: "7.0" }
});

export async function runMemoryAgent(task: any) {
  try {
    publish({
      id: `memory-${Date.now()}`,
      type: "agent_event",
      from: agent.id,
      payload: { stage: "memory_read", task },
      timestamp: Date.now()
    });

    const context = loadMemoryContext(task.payload.sessionId, task.payload.userId);

    writeWorkflowNote(task.payload.sessionId, "MemoryAgent accessed context");

    publish({
      id: `memory-${Date.now()}`,
      type: "memory_event",
      from: agent.id,
      payload: { stage: "memory_loaded", context },
      timestamp: Date.now()
    });

    return context;

  } catch (err: any) {
    publish({
      id: `memory-${Date.now()}`,
      type: "system_event",
      from: agent.id,
      payload: { error: err.message },
      timestamp: Date.now()
    });

    throw err;
  }
}