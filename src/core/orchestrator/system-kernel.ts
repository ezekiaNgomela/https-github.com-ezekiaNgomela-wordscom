// Phase 9 System Kernel (Orchestrator Layer)
// Central runtime bootstrap that wires all core subsystems together
// Safety-first: does NOT modify underlying modules, only composes them

import { PersistenceLayer } from "../persistence/persistence-layer";
import { SyncEngine } from "../sync/sync-engine";
import { AuthWorkspaceManager } from "../auth/auth-workspace";
import { EventPersistence } from "../events/event-persistence";
import { WebSocketCollaborationEngine } from "../collaboration/websocket-collaboration";
import { AIQueueSystem } from "../ai/ai-queue-system";
import { VersionMergeSystem } from "../version/version-merge-system";

export interface SystemKernelConfig {
  persistence: PersistenceLayer;
  sync: SyncEngine;
  auth: AuthWorkspaceManager;
  events: EventPersistence;
  collaboration: WebSocketCollaborationEngine;
  aiQueue: AIQueueSystem;
  versioning: VersionMergeSystem;
}

export class SystemKernel {
  private initialized = false;

  constructor(private config: SystemKernelConfig) {}

  // -----------------------------
  // BOOTSTRAP
  // -----------------------------

  async initialize() {
    if (this.initialized) return;

    // 1. Initialize auth state
    await this.config.auth.initialize();

    // 2. Bind sync listeners to event system
    this.config.sync.subscribe((op) => {
      this.config.events.emit({
        type: "sync_operation",
        entityType: op.entityType as any,
        entityId: op.entityId,
        payload: op,
        workspaceId: (this.config.auth.getActiveWorkspace() as string) || undefined,
        userId: this.config.auth.getCurrentUser()?.userId,
      });
    });

    // 3. Bind AI queue to event system
    this.config.aiQueue.enqueue({
      type: "reason",
      workspaceId: this.config.auth.getActiveWorkspace() || "default",
      priority: "low",
      payload: { message: "SystemKernel initialized" },
      userId: this.config.auth.getCurrentUser()?.userId,
    });

    this.initialized = true;
  }

  // -----------------------------
  // SYSTEM ACCESSORS
  // -----------------------------

  getPersistence() {
    return this.config.persistence;
  }

  getSync() {
    return this.config.sync;
  }

  getAuth() {
    return this.config.auth;
  }

  getEvents() {
    return this.config.events;
  }

  getCollaboration() {
    return this.config.collaboration;
  }

  getAIQueue() {
    return this.config.aiQueue;
  }

  getVersioning() {
    return this.config.versioning;
  }

  // -----------------------------
  // HIGH-LEVEL OPERATIONS
  // -----------------------------

  createWorkspaceScopedEvent(type: string, entityId: string, payload: any) {
    return this.config.events.emit({
      type: type as any,
      entityType: "workspace",
      entityId,
      payload,
      workspaceId: this.config.auth.getActiveWorkspace(),
      userId: this.config.auth.getCurrentUser()?.userId,
    });
  }

  triggerAISyncJob(payload: any, priority: "low" | "normal" | "high" | "critical" = "normal") {
    this.config.aiQueue.enqueue({
      type: "sync",
      workspaceId: this.config.auth.getActiveWorkspace() || "default",
      payload,
      priority,
      userId: this.config.auth.getCurrentUser()?.userId,
    });
  }

  broadcastCollaborationUpdate(type: any, payload: any) {
    const workspaceId = this.config.auth.getActiveWorkspace() || "default";
    const userId = this.config.auth.getCurrentUser()?.userId || "anonymous";

    this.config.collaboration.emitAIUpdate(workspaceId, userId, payload);
  }

  // -----------------------------
  // VERSION CONTROL HOOK
  // -----------------------------

  mergeVersion(base: any, incoming: any, local?: any) {
    return this.config.versioning.merge(base, incoming, local);
  }
}
