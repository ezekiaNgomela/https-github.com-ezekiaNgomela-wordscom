// Phase 33.3 - Real-time Collaboration Engine (WebSocket Layer)
// Enables multi-user live editing, presence, and block synchronization

import { WebSocketServer } from "ws";
import { BlockService } from "../editor/block.service";

interface Client {
  id: string;
  userId: string;
  documentId: string;
  socket: any;
}

const clients = new Map<string, Client>();

export class CollaborationGateway {
  private wss: WebSocketServer;

  constructor(server: any) {
    this.wss = new WebSocketServer({ server });
    this.init();
  }

  private init() {
    this.wss.on("connection", (socket) => {
      let clientId = "";

      socket.on("message", async (raw: string) => {
        const msg = JSON.parse(raw);

        switch (msg.type) {
          case "join": {
            clientId = msg.clientId;

            clients.set(clientId, {
              id: clientId,
              userId: msg.userId,
              documentId: msg.documentId,
              socket,
            });

            this.broadcast(msg.documentId, {
              type: "presence",
              userId: msg.userId,
              action: "join",
            });
            break;
          }

          case "block:update": {
            const updated = await BlockService.updateBlock(
              msg.documentId,
              msg.blockId,
              msg.updates
            );

            this.broadcast(msg.documentId, {
              type: "block:update",
              block: updated,
            });
            break;
          }

          case "block:create": {
            const block = await BlockService.createBlock(msg.payload);

            this.broadcast(msg.payload.documentId, {
              type: "block:create",
              block,
            });
            break;
          }

          case "block:delete": {
            await BlockService.deleteBlock(
              msg.documentId,
              msg.blockId
            );

            this.broadcast(msg.documentId, {
              type: "block:delete",
              blockId: msg.blockId,
            });
            break;
          }

          case "block:reorder": {
            const blocks = await BlockService.reorderBlocks(
              msg.documentId,
              msg.order
            );

            this.broadcast(msg.documentId, {
              type: "block:reorder",
              blocks,
            });
            break;
          }

          case "cursor:update": {
            this.broadcast(msg.documentId, {
              type: "cursor:update",
              userId: msg.userId,
              position: msg.position,
            });
            break;
          }
        }
      });

      socket.on("close", () => {
        if (!clientId) return;

        const client = clients.get(clientId);
        if (!client) return;

        clients.delete(clientId);

        this.broadcast(client.documentId, {
          type: "presence",
          userId: client.userId,
          action: "leave",
        });
      });
    });
  }

  private broadcast(documentId: string, message: any) {
    for (const client of clients.values()) {
      if (client.documentId === documentId) {
        client.socket.send(JSON.stringify(message));
      }
    }
  }
}
