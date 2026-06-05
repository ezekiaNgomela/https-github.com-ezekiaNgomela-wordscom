// Phase 14 - Production Integration Layer
// This wires ALL core systems into a single production-ready runtime graph
// Activates database + event sourcing + kernel + realtime in one bootstrap

import { bootSystem, kernel } from "../bootstrap/runtime-bootstrap";
import { PostgresAdapter } from "../db/postgres-adapter";
import { PostgresEventAdapter } from "../db/postgres-event-adapter";

export interface ProductionConfig {
  postgresConnectionString: string;
  port?: number;
}

export async function initProduction(config: ProductionConfig) {
  console.log("🚀 Initializing WordCom Production Layer...");

  const postgres = new PostgresAdapter({
    connectionString: config.postgresConnectionString,
  });

  await postgres.connect();

  const eventAdapter = new PostgresEventAdapter({
    postgres,
    table: "system_events",
  });

  const events = kernel.getEvents();

  if ((events as any).setAdapter) {
    (events as any).setAdapter(eventAdapter);
  } else {
    console.warn("Event adapter injection point not available yet");
  }

  await bootSystem();

  const dbHealth = await postgres.healthCheck();

  console.log("📊 Production system ready");
  console.log("DB Status:", dbHealth);

  return {
    kernel,
    postgres,
    eventAdapter,
  };
}
