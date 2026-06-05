// Phase 11 - Production WebSocket Server Layer
// Real transport layer for WebSocketCollaborationEngine
// Bridges external clients to internal collaboration engine

import { WebSocketServer } from "ws";
import { WebSocketCollaborationEngine, CollaborationMessage } from "../../core/collaboration/websocket-collaboration";

export interface RealtimeServerConfig {
  port: number;
  collaboration: WebSocketCollaborationEngine;
}

export class RealtimeWebSocketServer {
  private wss: WebSocketServer;
  private clients = new Map<string, any>();

  constructor(private config: RealtimeServerConfig) {
    this.wss = new WebSocketServer({ port: config.port });
  }

  start() {
    this.wss.on("connection", (ws: any, req: any) => {
      let userId: string | null = null;
      let workspaceId: string | null = null;

      ws.on("message", (data: any) => {
        try {
          const msg = JSON.parse(data.toString());

          // Initial handshake
          if (msg.type === "init") {
            userId = msg.userId;
            workspaceId = msg.workspaceId;

            const clientKey = `${workspaceId}:${userId}`;

            this.clients.set(clientKey, ws);

            this.config.collaboration.connect({
              userId,
              workspaceId,
              send: (m: CollaborationMessage) => {
                ws.send(JSON.stringify(m));
              },
              disconnect: () => ws.close(),
            });

            return;
          }

          // Forward collaboration messages
          if (userId && workspaceId) {
            const collabMsg: CollaborationMessage = {
              id: msg.id || `msg_${Date.now()}`,
              type: msg.type,
              userId,
              workspaceId,
              payload: msg.payload,
              timestamp: Date.now(),
            };

            this.config.collaboration.send(collabMsg);
          }
        } catch (err) {
          console.error("WebSocket message error:", err);
        }
      });

      ws.on("close", () => {
        if (userId && workspaceId) {
          this.config.collaboration.disconnect(userId, workspaceId);
          this.clients.delete(`${workspaceId}:${userId}`);
        }
      });
    });

    console.log(`Realtime WebSocket Server running on port ${this.config.port}`);
  }

  stop() {
    this.wss.close();
    this.clients.clear();
  }
}
