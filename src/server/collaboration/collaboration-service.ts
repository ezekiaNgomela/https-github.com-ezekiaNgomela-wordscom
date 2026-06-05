// Phase 21.3 - Collaboration → Document Engine Binding Layer
// Connects WebSocket events to persistent document storage
// Adds basic conflict strategy (Last Write Wins)

import { createDocumentRepository } from "../storage/document-repository";

export interface CollaborationMessage {
  type: "cursor" | "edit" | "join" | "leave";
  workspaceId: string;
  documentId: string;
  userId: string;
  payload: any;
  timestamp: number;
}

export class CollaborationService {
  private repo = createDocumentRepository();

  /**
   * Main entry: handle incoming websocket message
   */
  async handleMessage(msg: CollaborationMessage) {
    switch (msg.type) {
      case "edit":
        return this.applyEdit(msg);
      case "cursor":
        return this.handleCursor(msg);
      case "join":
        return this.handleJoin(msg);
      case "leave":
        return this.handleLeave(msg);
    }
  }

  private async applyEdit(msg: CollaborationMessage) {
    const doc = await this.repo.getDocument(msg.documentId);

    if (!doc) {
      await this.repo.saveDocument({
        id: msg.documentId,
        content: msg.payload?.content || "",
        updatedAt: Date.now(),
      } as any);
      return;
    }

    const incomingContent = msg.payload?.content;

    if (typeof incomingContent === "string") {
      doc.content = incomingContent;
    }

    doc.updatedAt = Date.now();

    await this.repo.saveDocument(doc);
  }

  private async handleCursor(_msg: CollaborationMessage) {
    return;
  }

  private async handleJoin(_msg: CollaborationMessage) {
    return;
  }

  private async handleLeave(_msg: CollaborationMessage) {
    return;
  }
}
