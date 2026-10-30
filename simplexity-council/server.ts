import express from 'express';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to get server-side Google GenAI
const getAi = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in server environment');
  }
  return new GoogleGenAI({ apiKey });
};

const CANDIDATE_MODELS = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];

// SSE streaming route for Council deliberation
app.post('/api/gemini/stream', async (req, res) => {
  const { prompt, temperature = 0.7 } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const ai = getAi();
  let streamStarted = false;
  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const responseStream = await ai.models.generateContentStream({
        model,
        contents: prompt,
        config: { temperature }
      });

      for await (const chunk of responseStream) {
        if (chunk.text) {
          res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
          streamStarted = true;
        }
      }

      if (streamStarted) {
        res.write(`data: [DONE]\n\n`);
        res.end();
        return;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`Stream attempt with ${model} failed:`, err?.message || err);
      if (streamStarted) break;
    }
  }

  res.write(`data: ${JSON.stringify({ error: lastError?.message || 'Deliberation generation failed across candidate models' })}\n\n`);
  res.end();
});

// Single-shot generation route (e.g. for orchestrator or search grounding)
app.post('/api/gemini/generate', async (req, res) => {
  const { prompt, temperature = 0.3, responseMimeType } = req.body;

  const ai = getAi();
  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const config: any = { temperature };
      if (responseMimeType) {
        config.responseMimeType = responseMimeType;
      }

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config
      });

      if (response.text) {
        return res.json({ text: response.text });
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`Generate attempt with ${model} failed:`, err?.message || err);
    }
  }

  res.status(500).json({ error: lastError?.message || 'Generation failed' });
});

// Grounded Google Search route
app.post('/api/gemini/search', async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'Missing query' });

  const ai = getAi();
  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: `Perform a search for: "${query}". Provide concise factual findings.`,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      const sources: Array<{ title: string; uri: string }> = [];
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        for (const c of chunks) {
          if (c.web?.uri) {
            sources.push({ title: c.web.title || 'Source', uri: c.web.uri });
          }
        }
      }

      return res.json({ text: response.text || '', sources: sources.slice(0, 2) });
    } catch (err: any) {
      lastError = err;
      console.warn(`Search attempt with ${model} failed:`, err?.message || err);
    }
  }

  res.status(500).json({ error: lastError?.message || 'Search failed' });
});

// Health / Status check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    apiKeyPresent: !!(process.env.GEMINI_API_KEY || process.env.API_KEY)
  });
});

// Mount Vite or serve static assets
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Simplexity Server listening on port ${port} (mode: ${isDev ? 'development' : 'production'})`);
  });
}

startServer();
