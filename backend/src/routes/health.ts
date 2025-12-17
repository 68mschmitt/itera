import { Router } from 'express';
import { checkOllamaHealth, listOllamaModels } from '../services/ollama.js';

const router = Router();

router.get('/health', async (_req, res, next) => {
  try {
    const ollamaStatus = await checkOllamaHealth();
    
    res.json({
      status: 'ok',
      timestamp: Date.now(),
      ollama: ollamaStatus
    });
  } catch (error) {
    next(error);
  }
});

router.get('/api/models', async (_req, res, next) => {
  try {
    const models = await listOllamaModels();
    res.json({ models });
  } catch (error) {
    next(error);
  }
});

export default router;
