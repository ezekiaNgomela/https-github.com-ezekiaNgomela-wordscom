// Phase 9 Core Layer - WebSocket Collaboration Engine
// Safety-first additive architecture (real-time collaboration over Sync + Events)
// Does NOT modify existing systems; consumes SyncEngine + EventPersistence

export type CollaborationMessageType =
  | "cursor_move"
  | "selection_change"
  | "document_edit"
  | "workspace_update"
  | "ai_suggestion"
  | "presence_update";

export interface CollaborationMessage {
  id: string;
  type: CollaborationMessageType;
  userId: string;
  workspaceId: string;
  payload: any;
  timestamp: number;
}

export interface CollaborationClient {
  userId: string;
  workspaceId: string;
  send: (msg: CollaborationMessage) => void;
  disconnect: () => void;
}

export class WebSocketCollaborationEngine {
  private clients: Map<string, CollaborationClient> = new Map();
  private listeners: ((msg: CollaborationMessage) => void)[] = [];

  connect(client: CollaborationClient) {
    const key = `${client.workspaceId}:${client.userId}`;
    this.clients.set(key, client);

    this.broadcast({
      id: `msg_${Date.now()}`,
      type: "presence_update",
      userId: client.userId,
      workspaceId: client.workspaceId,
      payload: { status: "online" },
      timestamp: Date.now(),
    });
  }

  disconnect(userId: string, workspaceId: string) {
    const key = `${workspaceId}:${userId}`;
    this.clients.delete(key);

    this.broadcast({
      id: `msg_${Date.now()}`,
      type: "presence_update",
      userId,
      workspaceId,
      payload: { status: "offline" },
      timestamp: Date.now(),
    });
  }

  send(message: CollaborationMessage) {
    const key = `${message.workspaceId}:${message.userId}`;
    const client = this.clients.get(key);

    if (client) client.send(message);

    this.notify(message);
  }

  broadcast(message: CollaborationMessage) {
    for (const client of this.clients.values()) {
      if (client.workspaceId === message.workspaceId) {
        client.send(message);
      }
    }

    this.notify(message);
  }

  subscribe(listener: (msg: CollaborationMessage) => void) {
    this.listeners.push(listener);
  }

  private notify(msg: CollaborationMessage) {
    for (const l of this.listeners) l(msg);
  }

  emitAIUpdate(workspaceId: string, userId: string, payload: any) {
    this.broadcast({
      id: `ai_${Date.now()}`,
      type: "ai_suggestion",
      userId,
      workspaceId,
      payload,
      timestamp: Date.now(),
    });
  }
}
