// Phase 32.3 - Redis Integration Layer
// Enables distributed rate limiting, session caching, and performance scaling

import { createClient } from "redis";

let client: ReturnType<typeof createClient> | null = null;

export function getRedis() {
  if (client) return client;

  const url = process.env.REDIS_URL;

  if (!url) {
    throw new Error("Missing REDIS_URL");
  }

  client = createClient({ url });

  client.on("error", (err) => {
    console.error("Redis Client Error", err);
  });

  client.connect();

  return client;
}

export async function redisSet(key: string, value: string, ttlSec?: number) {
  const r = getRedis();

  if (ttlSec) {
    await r.set(key, value, { EX: ttlSec });
  } else {
    await r.set(key, value);
  }
}

export async function redisGet(key: string) {
  const r = getRedis();
  return await r.get(key);
}

export async function redisDel(key: string) {
  const r = getRedis();
  return await r.del(key);
}
