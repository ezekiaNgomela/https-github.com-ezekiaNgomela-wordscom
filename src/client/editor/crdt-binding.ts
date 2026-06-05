// Phase 22.1 - CRDT + Editor Binding Layer
// Connects EditorEngine ↔ CRDTEngine ↔ WebSocket sync
// Enables live collaborative editing state reconciliation

import { EditorEngine } from "./editor-engine";
import { CRDTEngine, CRDTDocumentState, CRDTOperation } from "../../shared/collaboration/crdt-engine";
import { CollaborationClient } from "../collaboration/websocket-client";

export class CRDTBinding {
  private editor: EditorEngine;
  private crdt: CRDTEngine;
  private client: CollaborationClient;

  private state: CRDTDocumentState;

  constructor(
    editor: EditorEngine,
    client: CollaborationClient,
    initialContent: string = ""
  ) {
    this.editor = editor;
    this.client = client;

    this.crdt = new CRDTEngine();

    this.state = {
      id: "doc",
      content: initialContent,
      version: 0,
    };

    this.editor.setContent(initialContent);

    this.client.onMessage((msg) => {
      if (msg.type === "edit" && msg.payload?.content) {
        this.applyRemoteEdit(msg.payload.content);
      }
    });
  }

  applyLocalEdit(content: string, userId: string, documentId: string, workspaceId: string) {
    const op: CRDTOperation = {
      id: `${Date.now()}`,
      actorId: userId,
      documentId,
      timestamp: Date.now(),
      type: "replace",
      value: content,
    };

    this.state = this.crdt.apply(this.state, op);
    this.editor.setContent(this.state.content);

    this.client.sendEdit(workspaceId, documentId, userId, this.state.content);
  }

  applyRemoteEdit(content: string) {
    this.state = this.crdt.apply(this.state, {
      id: `${Date.now()}`,
      actorId: "remote",
      documentId: this.state.id,
      timestamp: Date.now(),
      type: "replace",
      value: content,
    });

    this.editor.setContent(this.state.content);
  }

  getState() {
    return this.state;
  }
}
