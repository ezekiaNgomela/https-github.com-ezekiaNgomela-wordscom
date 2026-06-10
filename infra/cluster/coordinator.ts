/**
 * cluster/coordinator.ts
 * -------------------------------------------------
 * Phase 10: Distributed Cluster Coordination Layer
 *
 * Provides:
 * - Cluster-wide event bus abstraction (Redis/NATS ready)
 * - Leader election primitive
 * - Distributed job coordination hooks
 *
 * NOTE:
 * This is infrastructure-agnostic scaffold.
 * You can plug Redis Pub/Sub or NATS JetStream later.
 */

import { eventBus } from '../eventBus';

export type ClusterMessage = {
  type: 'job' | 'heartbeat' | 'metrics' | 'leader_announce';
  nodeId: string;
  payload: any;
  timestamp: number;
};

export class ClusterCoordinator {
  private nodeId: string;
  private isLeader = false;
  private heartbeatInterval?: NodeJS.Timer;

  constructor(nodeId: string) {
    this.nodeId = nodeId;
  }

  /**
   * Start cluster coordination layer
   */
  public start() {
    this.startHeartbeat();
    this.startLeaderElection();
  }

  /**
   * HEARTBEAT BROADCAST
   */
  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      const msg: ClusterMessage = {
        type: 'heartbeat',
        nodeId: this.nodeId,
        payload: {
          isLeader: this.isLeader,
        },
        timestamp: Date.now(),
      };

      // local event bus (will later map to Redis/NATS)
      eventBus.emit('cluster_heartbeat', msg);
    }, 2000);
  }

  /**
   * SIMPLE LEADER ELECTION (placeholder algorithm)
   *
   * In production this becomes:
   * - Redis SETNX lock
   * - or NATS JetStream leader election
   */
  private startLeaderElection() {
    setInterval(() => {
      const decision = Math.random() > 0.5;

      const prev = this.isLeader;
      this.isLeader = decision;

      if (prev !== this.isLeader && this.isLeader) {
        eventBus.emit('cluster_leader_elected', {
          nodeId: this.nodeId,
          timestamp: Date.now(),
        });
      }
    }, 5000);
  }

  /**
   * Cluster-safe job dispatch hook
   */
  public broadcastJob(job: any) {
    const msg: ClusterMessage = {
      type: 'job',
      nodeId: this.nodeId,
      payload: job,
      timestamp: Date.now(),
    };

    eventBus.emit('cluster_job', msg);
  }

  public getStatus() {
    return {
      nodeId: this.nodeId,
      isLeader: this.isLeader,
    };
  }

  public stop() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
  }
}
