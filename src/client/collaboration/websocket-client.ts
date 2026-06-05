// Phase 21.6 - WebSocket Collaboration Client Layer
// Connects frontend editor → real-time collaboration server
// Handles join, edit, cursor events for live multi-user editing

export type CollaborationEventType = "cursor" | "edit" | "join" | "leave";

export interface CollaborationMessage {
  type: CollaborationEventType;
  workspaceId: string;
  documentId: string;
  userId: string;
  payload?: any;
  timestamp: number;
}

export class CollaborationClient {
  private ws: WebSocket | null = null;
  private url: string;
  private listeners: ((msg: CollaborationMessage) => void)[] = [];

  constructor(url: string = "ws://localhost:8080") {
    this.url = url;
  }

  connect() {
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log("Collaboration client connected");
    };

    this.ws.onmessage = (event) => {
      try {
        const msg: CollaborationMessage = JSON.parse(event.data);
        this.listeners.forEach((l) => l(msg));
      } catch (err) {
        console.error("Invalid collaboration message", err);
      }
    };

    this.ws.onclose = () => {
      console.log("Collaboration client disconnected");
    };
  }

  onMessage(listener: (msg: CollaborationMessage) => void) {
    this.listeners.push(listener);
  }

  send(msg: CollaborationMessage) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify(msg));
  }

  join(workspaceId: string, documentId: string, userId: string) {
    this.send({
      type: "join",
      workspaceId,
      documentId,
      userId,
      timestamp: Date.now(),
    });
  }

  sendEdit(workspaceId: string, documentId: string, userId: string, content: string) {
    this.send({
      type: "edit",
      workspaceId,
      documentId,
      userId,
      payload: { content },
      timestamp: Date.now(),
    });
  }

  sendCursor(workspaceId: string, documentId: string, userId: string, position: any) {
    this.send({
      type: "cursor",
      workspaceId,
      documentId,
      userId,
      payload: { position },
      timestamp: Date.now(),
    });
  }

  disconnect() {
    this.ws?.close();
    this.ws = null;
  }
}
