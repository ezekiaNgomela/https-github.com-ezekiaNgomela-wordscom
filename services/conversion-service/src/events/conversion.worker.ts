import { EventBus } from "../../ai-orchestrator-service/src/events/event-bus";

export function registerConversionWorker() {
  EventBus.on("CONVERT_DOCUMENT", async (data: any) => {
    console.log("[ConversionWorker] convert:", data);
  });
}
