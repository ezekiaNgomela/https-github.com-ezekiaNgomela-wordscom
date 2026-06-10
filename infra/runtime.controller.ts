/**
 * runtime.controller.ts
 * -------------------------------------------------
 * Phase 5: System control plane
 *
 * Responsibilities:
 * - Start Runtime (worker pool + execution bridge)
 * - Provide HTTP ingestion API for jobs
 * - Expose system status endpoint
 * - Prepare hook for controlLoop feedback integration
 */

import http from 'http';
import { Runtime } from './runtime';
import { queue } from './queue';

/**
 * Control Plane Wrapper
 */
export class RuntimeController {
  private runtime: Runtime;

  constructor(workerCount = 2) {
    this.runtime = new Runtime(workerCount);
  }

  /**
   * Start full system + API layer
   */
  public start(port = 3000) {
    // Start execution runtime
    this.runtime.start();

    // Start HTTP ingestion API
    const server = http.createServer(async (req, res) => {
      try {
        if (req.method === 'POST' && req.url === '/job') {
          let body = '';

          req.on('data', chunk => (body += chunk));

          req.on('end', () => {
            try {
              const job = JSON.parse(body || '{}');

              queue.enqueue?.({
                id: job.id || `job-${Date.now()}`,
                type: job.type || 'default',
                data: job.data || {},
              });

              res.writeHead(200);
              res.end(JSON.stringify({ status: 'queued' }));
            } catch (err: any) {
              res.writeHead(400);
              res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
            }
          });

          return;
        }

        if (req.method === 'GET' && req.url === '/status') {
          const status = this.runtime.status();

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(status));
          return;
        }

        res.writeHead(404);
        res.end('Not Found');
      } catch (err: any) {
        res.writeHead(500);
        res.end('Internal Server Error');
      }
    });

    server.listen(port, () => {
      console.log(`[RuntimeController] API running on port ${port}`);
    });

    // TODO: Wire controlLoop feedback system
    // - connect worker results → controlLoop
    // - enable adaptive scaling decisions
    this.wireControlLoop();
  }

  /**
   * Placeholder integration hook
   */
  private wireControlLoop() {
    // Future Phase 5.1:
    // - subscribe to workerProcessManager events
    // - forward job results to controlLoop
    // - enable scaling decisions based on throughput

    console.log('[RuntimeController] controlLoop wiring pending');
  }
}

/**
 * Auto-start if executed directly
 */
const isMain = require.main === module;

if (isMain) {
  const controller = new RuntimeController(2);
  controller.start(3000);
}
