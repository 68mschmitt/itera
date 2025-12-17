import { Router, Request, Response, NextFunction } from 'express';
import * as promptService from '../services/promptService.js';
import { diffWords, diffLines } from 'diff';

const router = Router();

/**
 * POST /api/prompts
 * Create a new prompt
 */
router.post('/api/prompts', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body;
    
    if (!name || typeof name !== 'string') {
      res.status(400).json({ error: 'Name is required and must be a string' });
      return;
    }
    
    const prompt = promptService.createPrompt(name);
    res.status(201).json(prompt);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/prompts/:id
 * Get prompt with all versions
 */
router.get('/api/prompts/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const promptId = parseInt(req.params.id);
    
    if (isNaN(promptId)) {
      res.status(400).json({ error: 'Invalid prompt ID' });
      return;
    }
    
    const prompt = promptService.getPromptWithVersions(promptId);
    
    if (!prompt) {
      res.status(404).json({ error: 'Prompt not found' });
      return;
    }
    
    res.json(prompt);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/prompts/:id/versions
 * Create new version (transactional)
 */
router.post('/api/prompts/:id/versions', (req: Request, res: Response, next: NextFunction) => {
  try {
    const promptId = parseInt(req.params.id);
    const { content } = req.body;
    
    if (isNaN(promptId)) {
      res.status(400).json({ error: 'Invalid prompt ID' });
      return;
    }
    
    if (!content || typeof content !== 'string') {
      res.status(400).json({ error: 'Content is required and must be a string' });
      return;
    }
    
    // This executes in a transaction (IMMEDIATE mode for write safety)
    const version = promptService.createVersion(promptId, content);
    res.status(201).json(version);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/prompts/:id/default
 * Set default version (for rollback or manual selection)
 */
router.put('/api/prompts/:id/default', (req: Request, res: Response, next: NextFunction) => {
  try {
    const promptId = parseInt(req.params.id);
    const { version_id } = req.body;
    
    if (isNaN(promptId)) {
      res.status(400).json({ error: 'Invalid prompt ID' });
      return;
    }
    
    if (!version_id || typeof version_id !== 'number') {
      res.status(400).json({ error: 'version_id is required and must be a number' });
      return;
    }
    
    const prompt = promptService.setDefaultVersion(promptId, version_id);
    res.json(prompt);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/prompts/:id/versions/:v1/:v2/diff
 * Get diff between two versions
 */
router.get('/api/prompts/:id/versions/:v1/:v2/diff', (req: Request, res: Response, next: NextFunction) => {
  try {
    const promptId = parseInt(req.params.id);
    const version1Id = parseInt(req.params.v1);
    const version2Id = parseInt(req.params.v2);
    
    if (isNaN(promptId) || isNaN(version1Id) || isNaN(version2Id)) {
      res.status(400).json({ error: 'Invalid ID parameters' });
      return;
    }
    
    const { version_a, version_b } = promptService.getVersionsForDiff(promptId, version1Id, version2Id);
    
    // Generate diff using the 'diff' library
    // Using diffWords for more granular differences
    const diffResult = diffWords(version_a.content, version_b.content);
    
    // Transform diff result into a more frontend-friendly format
    const diff = diffResult.map(part => ({
      type: part.added ? 'added' : part.removed ? 'removed' : 'unchanged',
      value: part.value
    }));
    
    res.json({
      version_a: {
        id: version_a.id,
        version_number: version_a.version_number,
        content: version_a.content
      },
      version_b: {
        id: version_b.id,
        version_number: version_b.version_number,
        content: version_b.content
      },
      diff
    });
  } catch (error) {
    next(error);
  }
});

export default router;
