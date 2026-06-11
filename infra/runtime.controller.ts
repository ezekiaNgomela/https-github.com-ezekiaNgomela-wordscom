/**
 * runtime.controller.ts
 * -------------------------------------------------
 * Phase 5: Control plane (event-sourced alignment)
 * Refactored to remove legacy queue dependency
 */

import http from 'http';
import { Runtime } from './runtime';
import { eventStore } from './eventStore';

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
    this.runtime.start();

    const server = http.createServer(async (req, res) => {
      try {
        if (req.method === 'POST' && req.url === '/job') {
          let body = '';

          req.on('data', chunk => (body += chunk));

          req.on('end', async () => {
            try {
              const job = JSON.parse(body || '{}');

              // Convert legacy job → event (transition layer)
              const event = {
                id: job.id || `evt-${Date.now()}`,
                type: 'COMMAND_CREATED',
                entityId: job.entityId || 'default',
                version: 1,
                timestamp: Date.now(),
                causalChainId: 'api',
                payload: job.data || {},
              };

              await eventStore.append(event);

              res.writeHead(200);
              res.end(JSON.stringify({ status: 'event_created' }));
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

    this.wireControlLoop();
  }

  private wireControlLoop() {
    console.log('[RuntimeController] controlLoop wiring pending (event-sourced mode)');
  }
}

const isMain = require.main === module;

if (isMain) {
  const controller = new RuntimeController(2);
  controller.start(3000);
}