import { Router, Request, Response, NextFunction } from 'express';
import * as runService from '../services/runService.js';

const router = Router();

/**
 * POST /api/runs
 * Execute a run with specified prompt version and input
 */
router.post('/api/runs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { prompt_version_id, input_json, model_params } = req.body;
    
    // Validation
    if (!prompt_version_id || typeof prompt_version_id !== 'number') {
      res.status(400).json({ error: 'prompt_version_id is required and must be a number' });
      return;
    }
    
    if (!input_json || typeof input_json !== 'object') {
      res.status(400).json({ error: 'input_json is required and must be an object' });
      return;
    }
    
    if (!model_params || typeof model_params !== 'object' || !model_params.model) {
      res.status(400).json({ error: 'model_params is required and must include a model field' });
      return;
    }
    
    const run = await runService.createRun({
      prompt_version_id,
      input_json,
      model_params
    });
    
    res.status(201).json(run);
  } catch (error: any) {
    // Check if it's a template variable error
    if (error.message && error.message.startsWith('Missing required variable:')) {
      res.status(400).json({ error: error.message });
      return;
    }
    next(error);
  }
});

/**
 * GET /api/prompts/:promptId/runs
 * List runs for a prompt (across all versions)
 */
router.get('/api/prompts/:promptId/runs', (req: Request, res: Response, next: NextFunction) => {
  try {
    const promptId = parseInt(req.params.promptId);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    const versionId = req.query.version_id ? parseInt(req.query.version_id as string) : undefined;
    
    if (isNaN(promptId)) {
      res.status(400).json({ error: 'Invalid prompt ID' });
      return;
    }
    
    const result = runService.listRunsForPrompt(promptId, { limit, offset, versionId });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/runs/:id
 * Get complete run detail
 */
router.get('/api/runs/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const runId = parseInt(req.params.id);
    
    if (isNaN(runId)) {
      res.status(400).json({ error: 'Invalid run ID' });
      return;
    }
    
    const run = runService.getRun(runId);
    
    if (!run) {
      res.status(404).json({ error: 'Run not found' });
      return;
    }
    
    // Parse JSON fields for frontend consumption
    const response = {
      ...run,
      input_json: JSON.parse(run.input_json),
      template_vars_json: JSON.parse(run.template_vars_json),
      provider_spec_json: JSON.parse(run.provider_spec_json),
      model_params_json: JSON.parse(run.model_params_json)
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/runs/:id/rerun
 * Re-execute a run with exact same configuration
 */
router.post('/api/runs/:id/rerun', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const runId = parseInt(req.params.id);
    
    if (isNaN(runId)) {
      res.status(400).json({ error: 'Invalid run ID' });
      return;
    }
    
    const newRun = await runService.rerunRun(runId);
    res.status(201).json(newRun);
  } catch (error: any) {
    if (error.message && error.message.includes('not found')) {
      res.status(404).json({ error: error.message });
      return;
    }
    next(error);
  }
});

export default router;
