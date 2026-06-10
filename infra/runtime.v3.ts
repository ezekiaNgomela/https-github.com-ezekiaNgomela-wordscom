/**
 * runtime.v3.ts
 * -------------------------------------------------
 * Phase 6 Step 4 (Activation Layer)
 *
 * This is the fully wired runtime that connects:
 * - WorkerProcessManagerV2 (multi-process execution)
 * - ExecutionBridge (queue → workers)
 * - ControlLoopBinding (metrics + intelligence)
 * - EventBus (system-wide telemetry)
 *
 * NOTE:
 * This is a non-destructive activation layer.
 */

import { WorkerProcessManagerV2 } from './workerProcess.v2';
import { ExecutionBridge } from './executionBridge';
import { RuntimeController } from './runtime.controller';
import { controlLoopBinding } from './controlLoop.binding';
import { eventBus } from './eventBus';

export class RuntimeV3 {
  private manager: WorkerProcessManagerV2;
  private bridge: ExecutionBridge;
  private controller: RuntimeController;

  constructor(workerCount = 2, port = 3000) {
    this.manager = new WorkerProcessManagerV2(workerCount);
    this.bridge = new ExecutionBridge(this.manager as any);
    this.controller = new RuntimeController(workerCount);

    // Bind control loop BEFORE startup
    this.bindIntelligenceLayer();
  }

  /**
   * Wire system intelligence layer
   */
  private bindIntelligenceLayer() {
    // Start control loop metrics engine
    controlLoopBinding.start();

    // Listen to system metrics signals
    eventBus.on('system_metrics', (signal: any) => {
      console.log('[RuntimeV3] Scaling signal received:', signal);

      // NOTE: Dynamic scaling not fully implemented yet
      // This is the decision layer hook point
      // Future: call manager.scaleUp()/scaleDown()
    });

    // Optional: additional observability hooks
    eventBus.on('worker_failed', (event: any) => {
      console.log('[RuntimeV3] Worker failure detected:', event);
    });
  }

  /**
   * Start full system
   */
  public start(port = 3000) {
    console.log('[RuntimeV3] Starting fully integrated runtime...');

    // 1. Start worker pool
    this.manager.start();

    // 2. Start execution bridge
    this.bridge.start(100);

    // 3. Start HTTP control plane
    this.controller.start(port);

    console.log('[RuntimeV3] System is now ACTIVE (event-driven + multi-process)');
  }

  /**
   * Stop system
   */
  public stop() {
    console.log('[RuntimeV3] Stopping system...');
    this.controller.stop();
  }

  /**
   * System status snapshot
   */
  public status() {
    return {
      workers: this.manager.getStatus(),
      mode: 'v3-event-driven-runtime',
    };
  }
}

/**
 * Auto-start entrypoint
 */
const isMain = require.main === module;

if (isMain) {
  const runtime = new RuntimeV3(2, 3000);
  runtime.start(3000);
}
