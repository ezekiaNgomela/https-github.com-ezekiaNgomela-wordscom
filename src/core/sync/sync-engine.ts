// Phase 9 Core Layer - Sync Engine
// Safety-first additive architecture (coordinates state between Workspace, Memory, Persistence)

export type SyncOperationType =
  | "create"
  | "update"
  | "delete"
  | "merge"
  | "patch";

export interface SyncOperation {
  id: string;
  type: SyncOperationType;
  entityType: "document" | "workspace" | "memory" | "event" | "version";
  entityId: string;
  payload?: any;
  timestamp: number;
  source: "local" | "remote" | "ai";
}

export interface SyncState {
  lastSyncAt: number;
  pendingQueue: SyncOperation[];
  isOnline: boolean;
}

export interface SyncAdapter {
  push: (op: SyncOperation) => Promise<void>;
  pull: (since: number) => Promise<SyncOperation[]>;
  ack: (operationId: string) => Promise<void>;
}

export class SyncEngine {
  private state: SyncState;
  private listeners: ((op: SyncOperation) => void)[] = [];

  constructor(private adapter?: SyncAdapter) {
    this.state = {
      lastSyncAt: Date.now(),
      pendingQueue: [],
      isOnline: true,
    };
  }

  enqueue(op: Omit<SyncOperation, "id" | "timestamp">) {
    const operation: SyncOperation = {
      id: `op_${Date.now()}_${Math.random()}`,
      timestamp: Date.now(),
      ...op,
    };

    this.state.pendingQueue.push(operation);
    this.notify(operation);
  }

  async flush(): Promise<void> {
    if (!this.adapter) return;

    const queue = [...this.state.pendingQueue];
    this.state.pendingQueue = [];

    for (const op of queue) {
      await this.adapter.push(op);
      await this.adapter.ack(op.id);
    }

    this.state.lastSyncAt = Date.now();
  }

  async pull(): Promise<void> {
    if (!this.adapter) return;

    const remoteOps = await this.adapter.pull(this.state.lastSyncAt);

    for (const op of remoteOps) {
      this.notify(op);
    }

    this.state.lastSyncAt = Date.now();
  }

  subscribe(listener: (op: SyncOperation) => void) {
    this.listeners.push(listener);
  }

  private notify(op: SyncOperation) {
    for (const listener of this.listeners) {
      listener(op);
    }
  }

  getState(): SyncState {
    return this.state;
  }

  setOnline(status: boolean) {
    this.state.isOnline = status;
  }

  aiBroadcast(entityType: SyncOperation["entityType"], entityId: string, payload: any) {
    this.enqueue({
      type: "update",
      entityType,
      entityId,
      payload,
      source: "ai",
    });
  }
}
