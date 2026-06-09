import { EventBus } from "../../ai-orchestrator-service/src/events/event-bus";

export function registerDocumentWorker() {
  EventBus.on("DOCUMENT_CREATE", async (data: any) => {
    console.log("[DocumentWorker] create:", data);
  });
}
