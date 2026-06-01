import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { registerAiRoutes } from './server/ai-routes.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createServer() {
  const app = express();

  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
    root: path.join(__dirname, 'apps/web')
  });

  app.use(express.json({ limit: '50mb' }));
  registerAiRoutes(app);

  // Use vite's connect instance as middleware
  app.use(vite.middlewares);

  app.listen(3000, () => {
    console.log('Dev Server started on http://localhost:3000');
  });
}

createServer();
