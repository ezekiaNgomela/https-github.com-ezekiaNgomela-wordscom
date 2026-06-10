import { AgentReputation } from "../../infra/reputation";
import * as fs from "fs";
import * as path from "path";

/**
 * Minimal persistent reputation store (Phase 14)
 * - In-memory cache
 * - JSON file persistence for durability
 */

const DB_PATH = path.join(process.cwd(), "reputation-db.json");

let cache: Record<string, AgentReputation> = {};

function loadFromDisk() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, "utf-8");
      cache = JSON.parse(raw);
    }
  } catch (err) {
    console.error("Failed to load reputation DB:", err);
    cache = {};
  }
}

function saveToDisk() {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(cache, null, 2));
  } catch (err) {
    console.error("Failed to save reputation DB:", err);
  }
}

export function getReputation(agentId: string): AgentReputation | undefined {
  return cache[agentId];
}

export function setReputation(agent: AgentReputation) {
  cache[agent.agentId] = agent;
  saveToDisk();
}

export function updateReputationStore(agent: AgentReputation) {
  cache[agent.agentId] = agent;
  saveToDisk();
}

export function initReputationStore() {
  loadFromDisk();
}
