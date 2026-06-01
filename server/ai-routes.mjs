import { GoogleGenAI } from '@google/genai';
import admin from 'firebase-admin';

const TEXT_MODEL = 'gemini-2.5-flash';
const VISION_MODEL = 'gemini-2.5-flash';
const AUDIO_MODEL = 'gemini-2.5-flash';

let adminInitAttempted = false;
const ensureFirebaseAdmin = () => {
  if (admin.apps.length || adminInitAttempted) return admin.apps.length > 0;
  adminInitAttempted = true;

  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)) });
    return true;
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    admin.initializeApp({ credential: admin.credential.applicationDefault() });
    return true;
  }

  return false;
};

const stripMarkdownFences = (value = '') => value.replace(/```html/g, '').replace(/```/g, '').trim();

const buildPrompt = (command, content, message = '') => {
  const commands = {
    rewrite: 'Rewrite this document so it is clearer, tighter, and easier to read.',
    formal: 'Rewrite this document in a formal, professional tone with strong business writing.',
    summarize: 'Summarize this document into a concise executive summary with clear takeaways.',
    expand: 'Expand this draft with useful details, examples, and smooth transitions.',
    table: 'Turn the relevant content into a clean, useful table and keep supporting context.',
    proposal: 'Create a polished startup proposal with sections, headings, bullet points, timeline, and next steps. Auto-detect natural headings and apply clean document formatting.',
  };

  if (command === 'chat') {
    return `User request: ${message}\n\nDocument HTML:\n${content}\n\nReturn only the improved document HTML.`;
  }

  return `${commands[command] ?? message}\n\nDocument HTML:\n${content}\n\nReturn only semantic HTML with headings, paragraphs, lists, and tables when useful. Promote obvious section labels into h2 headings and apply professional auto formatting.`;
};

const premiumTextPrompt = (task, content, concept = '') => {
  const prompts = {
    refineGrammar: 'Refine the document for grammar, spelling, sentence clarity, flow, punctuation, and professional readability. Preserve meaning and return polished semantic HTML.',
    conceptNotes: `Create well-structured notes from the user's concept. Use a title, sections, bullets, key takeaways, and next actions. Return semantic HTML. Concept: ${concept}`,
    dialogNotes: `Turn this dialogue or meeting transcript into organized notes. Include summary, decisions, action items, owners if named, and follow-up questions. Return semantic HTML. Dialogue: ${concept}`,
  };

  return `${prompts[task] ?? prompts.refineGrammar}\n\nCurrent document HTML:\n${content}\n\nReturn only the final document HTML.`;
};

const scannerPrompt = (task, content = '') => {
  if (task === 'transcribeAudio') {
    return `Transcribe the audio precisely. Then produce a clean text document with a title, transcript, summary, and action items if present. Existing document context: ${content}`;
  }

  return `Extract all readable text from this image or video with high precision. Preserve order, headings, tables, labels, and line breaks where possible. Then produce a clean semantic HTML document. Existing document context: ${content}`;
};

const requirePremiumUser = async (req, res) => {
  if (process.env.WORDCOM_DISABLE_PREMIUM_GATE === 'true') return true;

  const hasAdmin = ensureFirebaseAdmin();
  if (!hasAdmin) {
    if (process.env.NODE_ENV !== 'production') return true;
    res.status(503).json({ error: 'Premium verification is not configured on this server.' });
    return false;
  }

  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) {
    res.status(401).json({ error: 'Sign in with a premium account to use this AI model.' });
    return false;
  }

  const decoded = await admin.auth().verifyIdToken(token);
  const userDoc = await admin.firestore().collection('users').doc(decoded.uid).get();
  const data = userDoc.exists ? userDoc.data() : {};
  const isPremium = Boolean(data?.isPremium);
  const premiumExpires = Number(data?.premiumExpires ?? 0);

  if (!isPremium || (premiumExpires && premiumExpires < Date.now())) {
    res.status(402).json({ error: 'This AI model is available to premium users only.' });
    return false;
  }

  return true;
};

const createAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing. Add it to .env.local to enable AI processing.');
  }
  return new GoogleGenAI({ apiKey });
};

export const registerAiRoutes = (app) => {
  const processAiDocument = async (req, res) => {
    try {
      const { command, content, message } = req.body;
      const ai = createAiClient();
      const response = await ai.models.generateContent({
        model: TEXT_MODEL,
        contents: buildPrompt(command, content, message),
        config: {
          systemInstruction: 'You are WordCom, an AI-native document workspace. Transform user intent into polished, structured HTML documents. Add document intelligence: infer headings, improve formatting, and provide context-aware structure. Return only document HTML; do not wrap output in markdown fences.',
          temperature: 0.25,
        },
      });

      res.json({ result: stripMarkdownFences(response.text() || '') });
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

  app.post('/api/ai/premium/document', async (req, res) => {
    try {
      if (!(await requirePremiumUser(req, res))) return;
      const { task, content, concept } = req.body;
      const ai = createAiClient();
      const response = await ai.models.generateContent({
        model: TEXT_MODEL,
        contents: premiumTextPrompt(task, content, concept),
        config: {
          systemInstruction: 'You are WordCom Premium AI. Provide high-accuracy grammar refinement, text polishing, and notes generation from concepts or dialogue. Return clean semantic HTML only.',
          temperature: 0.2,
        },
      });
      res.json({ result: stripMarkdownFences(response.text() || '') });
    } catch (error) {
      console.error('Error processing premium document:', error);
      res.status(500).json({ error: error.message || 'Error communicating with premium AI.' });
    }
  });

  app.post('/api/ai/premium/media', async (req, res) => {
    try {
      if (!(await requirePremiumUser(req, res))) return;
      const { task, content, media } = req.body;
      if (!media?.data || !media?.mimeType) {
        return res.status(400).json({ error: 'A media file is required for scanning or transcription.' });
      }

      const ai = createAiClient();
      const response = await ai.models.generateContent({
        model: task === 'transcribeAudio' ? AUDIO_MODEL : VISION_MODEL,
        contents: [
          { text: scannerPrompt(task, content) },
          { inlineData: { mimeType: media.mimeType, data: media.data } },
        ],
        config: {
          systemInstruction: 'You are WordCom Premium scanner AI. Extract text from images, video frames, and audio with maximum precision, then convert the result into a clean editable document. Return semantic HTML only.',
          temperature: 0.1,
        },
      });
      res.json({ result: stripMarkdownFences(response.text() || '') });
    } catch (error) {
      console.error('Error processing premium media:', error);
      res.status(500).json({ error: error.message || 'Error communicating with scanner AI.' });
    }
  });
};
