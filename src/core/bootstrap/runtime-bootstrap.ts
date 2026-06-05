// Phase 10 - Runtime Bootstrap Layer
// Initializes and wires the SystemKernel into a running application instance
// This is the actual entrypoint for executing the full WordCom Core OS

import { SystemKernel } from "../orchestrator/system-kernel";
import { PersistenceLayer } from "../persistence/persistence-layer";
import { SyncEngine } from "../sync/sync-engine";
import { AuthWorkspaceManager } from "../auth/auth-workspace";
import { EventPersistence } from "../events/event-persistence";
import { WebSocketCollaborationEngine } from "../collaboration/websocket-collaboration";
import { AIQueueSystem } from "../ai/ai-queue-system";
import { VersionMergeSystem } from "../version/version-merge-system";

// -----------------------------
// SIMPLE DEFAULT ADAPTERS (PLACEHOLDERS)
// -----------------------------

const persistence = new PersistenceLayer({} as any);
const sync = new SyncEngine();
const auth = new AuthWorkspaceManager({
  getCurrentUser: async () => null,
});
const events = new EventPersistence();
const collaboration = new WebSocketCollaborationEngine();
const aiQueue = new AIQueueSystem();
const versioning = new VersionMergeSystem();

// -----------------------------
// SYSTEM KERNEL INSTANCE
// -----------------------------

export const kernel = new SystemKernel({
  persistence,
  sync,
  auth,
  events,
  collaboration,
  aiQueue,
  versioning,
});

// -----------------------------
// BOOT FUNCTION
// -----------------------------

export async function bootSystem() {
  console.log("🚀 Booting WordCom Core OS...");

  await kernel.initialize();

  // Start AI queue loop
  aiQueue.start();

  console.log("✅ WordCom Core OS initialized successfully");

  return kernel;
}
