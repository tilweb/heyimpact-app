import { Router } from 'express';
import OpenAI from 'openai';
import { authenticateToken } from '../middleware/auth.js';
import config from '../config.js';

const router = Router();
router.use(authenticateToken);

function getClient() {
  return new OpenAI({
    baseURL: config.adacorApiBase,
    apiKey: config.adacorApiKey || 'not-set',
  });
}

router.post('/completions', async (req, res) => {
  try {
    const { messages, max_tokens = 1000, temperature = 0.7 } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    const client = getClient();

    // Set SSE headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = await client.chat.completions.create({
      model: config.adacorModel,
      messages,
      temperature,
      max_tokens,
      stream: true,
    });

    for await (const chunk of stream) {
      const data = JSON.stringify(chunk);
      res.write(`data: ${data}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    // If headers already sent (streaming started), just end
    if (res.headersSent) {
      res.end();
      return;
    }
    console.error('Chat API error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
