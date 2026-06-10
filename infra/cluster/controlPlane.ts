/**
 * cluster/controlPlane.ts
 * -------------------------------------------------
 * Phase 12: Fully Distributed Control Plane
 *
 * This is the single-source-of-truth orchestration layer for a
 * multi-node cluster.
 *
 * Responsibilities:
 * - Redis-based leader election (fault tolerant)
 * - Leader heartbeat renewal
 * - Cluster event bridging (Redis pub/sub)
 * - Global job dispatch coordination
 * - Hooks for autoscaler + worker systems
 *
 * NOTE:
 * This replaces any local-only runtime decision logic.
 */

import { RedisClient } from './redisClient';
import { eventBus } from '../eventBus';

export type ClusterJob = {
  id: string;
  type: string;
  payload: any;
  createdAt: number;
};

export class DistributedControlPlane {
  private nodeId: string;
  private redis: RedisClient;
  private isLeader = false;

  private leaderKey = 'wordscom:leader';
  private leaderTtl = 5000;
  private heartbeatInterval?: NodeJS.Timer;

  private jobQueueKey = 'wordscom:jobs';

  constructor(nodeId: string, redis: RedisClient) {
    this.nodeId = nodeId;
    this.redis = redis;
  }

  /**
   * Start full control plane lifecycle
   */
  public start() {
    this.startLeaderElectionLoop();
    this.startClusterSubscriptions();
    this.startJobDispatcher();
  }

  /**
   * LEADER ELECTION LOOP
   */
  private startLeaderElectionLoop() {
    setInterval(async () => {
      if (!this.isLeader) {
        const acquired = await this.redis.acquireLock(
          this.leaderKey,
          this.nodeId,
          this.leaderTtl
        );

        if (acquired) {
          this.becomeLeader();
        }
      } else {
        const extended = await this.redis.extendLock(
          this.leaderKey,
          this.nodeId,
          this.leaderTtl
        );

        if (!extended) {
          this.stepDown();
        }
      }
    }, 2000);
  }

  /**
   * BECOME LEADER
   */
  private becomeLeader() {
    this.isLeader = true;

    eventBus.emit('cluster_leader_elected', {
      nodeId: this.nodeId,
      timestamp: Date.now(),
    });

    console.log(`[ControlPlane] Node ${this.nodeId} became LEADER`);
  }

  /**
   * STEP DOWN
   */
  private stepDown() {
    if (this.isLeader) {
      console.log(`[ControlPlane] Node ${this.nodeId} lost leadership`);
    }
    this.isLeader = false;
  }

  /**
   * CLUSTER EVENT SUBSCRIPTIONS (Redis pub/sub bridge)
   */
  private startClusterSubscriptions() {
    this.redis.subscribe('cluster:events', (msg) => {
      eventBus.emit(msg.type, msg);
    });
  }

  /**
   * GLOBAL JOB DISPATCH LOOP (leader-only execution)
   */
  private startJobDispatcher() {
    setInterval(async () => {
      if (!this.isLeader) return;

      const rawJob = await this.redis.popJob(this.jobQueueKey);
      if (!rawJob) return;

      const job: ClusterJob = rawJob;

      eventBus.emit('cluster_job_dispatch', {
        leader: this.nodeId,
        job,
        timestamp: Date.now(),
      });

      console.log(`[ControlPlane] Dispatching job ${job.id}`);
    }, 500);
  }

  /**
   * External API: submit job to cluster
   */
  public async submitJob(job: ClusterJob) {
    await this.redis.pushJob(this.jobQueueKey, job);

    await this.redis.publish('cluster:events', {
      type: 'job_queued',
      nodeId: this.nodeId,
      payload: job,
      timestamp: Date.now(),
    });
  }

  /**
   * Status snapshot
   */
  public status() {
    return {
      nodeId: this.nodeId,
      isLeader: this.isLeader,
    };
  }

  /**
   * Stop control plane
   */
  public stop() {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    this.stepDown();
  }
}
