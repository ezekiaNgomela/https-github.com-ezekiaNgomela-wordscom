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

app.post('/api/process-document', async (req, res) => {
  try {
    const { action, content } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY environment variable is missing.' });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    let systemInstruction = "You are a professional document editing assistant. Your task is to output the final modified HTML content only, stripped of any markdown formatting (like ```html), preserving the general HTML structure but improving the content as requested.";
    let prompt = "";

    switch (action) {
      case 'Summarize':
         prompt = `Provide a concise, professional summary of the core concepts in this document. Replace the document content with this clear, easy-to-read summary:\n\n${content}`;
         break;
      case 'Refine Tone':
         prompt = `Rewrite the following document to have a highly professional, worldwide-recommended standard tone. Fix any grammar and structural issues while keeping the core meaning. Output the formatted HTML:\n\n${content}`;
         break;
      case 'Generate Body':
         prompt = `Please expand on the given document structure. Write comprehensive body paragraphs, correct grammar inconsistencies, and format the output professionally in HTML:\n\n${content}`;
         break;
      default:
         return res.status(400).json({ error: 'Invalid action.' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2
      }
    });

    let formattedContent = response.text() || '';
    // Strip markdown tags if Gemini wrapping occurred
    formattedContent = formattedContent.replace(/```html/g, '').replace(/```/g, '').trim();
    
    res.json({ result: formattedContent });

  } catch (error) {
    console.error('Error processing document:', error);
    res.status(500).json({ error: error.message || 'Error communicating with AI.' });
  }
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
