import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { registerAiRoutes } from './server/ai-routes.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

registerAiRoutes(app);

// For production, serve the Vite build
app.use(express.static(path.join(__dirname, 'apps/web/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'apps/web/dist', 'index.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
