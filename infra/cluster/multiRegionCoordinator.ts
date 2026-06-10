/**
 * cluster/multiRegionCoordinator.ts
 * -------------------------------------------------
 * Phase 13: Multi-Region Replication Layer
 *
 * Extends the single-cluster control plane into a
 * geo-distributed system with:
 *
 * - Region-aware coordination
 * - Cross-region heartbeat federation
 * - Primary region election (global leader)
 * - Replication-aware event propagation hooks
 *
 * NOTE:
 * This is an abstraction layer over:
 * - Redis replication (streams / sentinel / cluster)
 * - or NATS JetStream multi-cluster federation
 */

import { eventBus } from '../eventBus';
import { RedisClient } from './redisClient';

export type RegionState = {
  regionId: string;
  isPrimary: boolean;
  lastHeartbeat: number;
  latencyMs: number;
};

export type GlobalEvent = {
  type: string;
  regionId: string;
  payload: any;
  timestamp: number;
};

export class MultiRegionCoordinator {
  private regionId: string;
  private redis: RedisClient;

  private isPrimaryRegion = false;
  private regions: Map<string, RegionState> = new Map();

  private heartbeatInterval?: NodeJS.Timer;

  private primaryKey = 'wordscom:global:primary_region';
  private heartbeatKeyPrefix = 'wordscom:region:heartbeat:';

  constructor(regionId: string, redis: RedisClient) {
    this.regionId = regionId;
    this.redis = redis;
  }

  /**
   * Start multi-region coordination layer
   */
  public start() {
    this.startRegionalHeartbeat();
    this.startPrimaryElection();
    this.startCrossRegionListener();
  }

  /**
   * REGION HEARTBEAT (WAN-level liveness)
   */
  private startRegionalHeartbeat() {
    this.heartbeatInterval = setInterval(async () => {
      const key = `${this.heartbeatKeyPrefix}${this.regionId}`;

      await this.redis.kv.set(key, JSON.stringify({
        regionId: this.regionId,
        timestamp: Date.now(),
        isPrimary: this.isPrimaryRegion,
      }));

      eventBus.emit('region_heartbeat_local', {
        regionId: this.regionId,
        timestamp: Date.now(),
      });
    }, 3000);
  }

  /**
   * GLOBAL PRIMARY REGION ELECTION
   * (simplified: Redis lock; production = multi-region consensus)
   */
  private startPrimaryElection() {
    setInterval(async () => {
      if (!this.isPrimaryRegion) {
        const acquired = await this.redis.acquireLock(
          this.primaryKey,
          this.regionId,
          8000
        );

        if (acquired) {
          this.becomePrimary();
        }
      } else {
        const extended = await this.redis.extendLock(
          this.primaryKey,
          this.regionId,
          8000
        );

        if (!extended) {
          this.stepDownPrimary();
        }
      }
    }, 3000);
  }

  /**
   * Become global primary region
   */
  private becomePrimary() {
    this.isPrimaryRegion = true;

    eventBus.emit('global_primary_elected', {
      regionId: this.regionId,
      timestamp: Date.now(),
    });

    console.log(`[MultiRegion] ${this.regionId} became GLOBAL PRIMARY`);
  }

  /**
   * Step down from primary role
   */
  private stepDownPrimary() {
    if (this.isPrimaryRegion) {
      console.log(`[MultiRegion] ${this.regionId} lost GLOBAL PRIMARY`);
    }

    this.isPrimaryRegion = false;
  }

  /**
   * CROSS-REGION EVENT PROPAGATION
   */
  private startCrossRegionListener() {
    this.redis.subscribe('wordscom:global:events', (msg: GlobalEvent) => {
      // Merge remote region state into local view
      const existing = this.regions.get(msg.regionId);

      this.regions.set(msg.regionId, {
        regionId: msg.regionId,
        isPrimary: false,
        lastHeartbeat: Date.now(),
        latencyMs: existing?.latencyMs ?? 0,
      });

      eventBus.emit('global_event', msg);
    });
  }

  /**
   * Broadcast event across regions
   */
  public broadcastGlobalEvent(type: string, payload: any) {
    const event: GlobalEvent = {
      type,
      regionId: this.regionId,
      payload,
      timestamp: Date.now(),
    };

    this.redis.publish('wordscom:global:events', event);
  }

  /**
   * Region status snapshot
   */
  public status() {
    return {
      regionId: this.regionId,
      isPrimaryRegion: this.isPrimaryRegion,
      knownRegions: Array.from(this.regions.keys()),
    };
  }

  /**
   * Stop coordination
   */
  public stop() {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    this.stepDownPrimary();
  }
}
