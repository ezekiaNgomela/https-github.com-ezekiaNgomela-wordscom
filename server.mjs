import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));


const buildPrompt = (command, content, message = '') => {
  const commands = {
    rewrite: 'Rewrite this document so it is clearer, tighter, and easier to read.',
    formal: 'Rewrite this document in a formal, professional tone with strong business writing.',
    summarize: 'Summarize this document into a concise executive summary with clear takeaways.',
    expand: 'Expand this draft with useful details, examples, and smooth transitions.',
    table: 'Turn the relevant content into a clean, useful table and keep supporting context.',
    proposal: 'Create a polished startup proposal with sections, headings, bullet points, timeline, and next steps.',
  };

  if (command === 'chat') {
    return `User request: ${message}\n\nDocument HTML:\n${content}\n\nReturn only the improved document HTML.`;
  }

  return `${commands[command] ?? message}\n\nDocument HTML:\n${content}\n\nReturn only semantic HTML with headings, paragraphs, lists, and tables when useful.`;
};

const processAiDocument = async (req, res) => {
  try {
    const { command, content, message } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY environment variable is missing. Add it to .env.local to enable AI processing.' });
    }

    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: buildPrompt(command, content, message),
      config: {
        systemInstruction: 'You are WordCom, an AI-native document workspace. Transform user intent into polished, structured HTML documents. Return only document HTML; do not wrap output in markdown fences.',
        temperature: 0.25,
      },
    });

    const result = (response.text() || '').replace(/```html/g, '').replace(/```/g, '').trim();
    res.json({ result });
  } catch (error) {
    console.error('Error processing document:', error);
    res.status(500).json({ error: error.message || 'Error communicating with AI.' });
  }
};

app.post('/api/ai/document', processAiDocument);

app.post('/api/process-document', async (req, res) => {
  const actionMap = {
    'Summarize': 'summarize',
    'Refine Tone': 'formal',
    'Generate Body': 'expand',
  };
  req.body.command = actionMap[req.body.action] ?? req.body.action;
  await processAiDocument(req, res);
});

// For production, serve the Vite build
app.use(express.static(path.join(__dirname, 'apps/web/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'apps/web/dist', 'index.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
