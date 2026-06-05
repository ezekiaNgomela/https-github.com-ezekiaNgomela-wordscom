// Phase 21.2 - WebSocket Collaboration Sync Layer
// Enables real-time multi-user document editing foundation
// Provides event-based sync + conflict-ready architecture (CRDT-ready design)

import { Server } from "ws";

export interface CollaborationMessage {
  type: "cursor" | "edit" | "join" | "leave";
  workspaceId: string;
  documentId: string;
  userId: string;
  payload: any;
  timestamp: number;
}

export class CollaborationServer {
  private wss: Server;
  private clients = new Map<string, any>();

  constructor(port: number = 8080) {
    this.wss = new Server({ port });

    this.wss.on("connection", (ws) => {
      let userId: string | null = null;

      ws.on("message", (data) => {
        try {
          const msg: CollaborationMessage = JSON.parse(data.toString());

          if (msg.type === "join") {
            userId = msg.userId;
            this.clients.set(userId, ws);
          }

          this.broadcast(msg);
        } catch (err) {
          console.error("Collaboration message error:", err);
        }
      });

      ws.on("close", () => {
        if (userId) this.clients.delete(userId);
      });
    });

    console.log(`Collaboration server running on ws://localhost:${port}`);
  }

  private broadcast(msg: CollaborationMessage) {
    this.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(JSON.stringify(msg));
      }
    });
  }
}

export function startCollaborationServer() {
  return new CollaborationServer(Number(process.env.WS_PORT || 8080));
}
