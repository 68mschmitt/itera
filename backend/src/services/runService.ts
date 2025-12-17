import { db } from '../config/database.js';
import { executeOllamaRun, OllamaRunRequest } from './ollama.js';
import { renderPrompt, generateInputHash } from './templateUtils.js';
import { getVersion } from './promptService.js';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL_ITERA || 'http://localhost:11434';

// Types
export interface Run {
  id: number;
  prompt_version_id: number;
  input_json: string;
  input_hash: string;
  template_vars_json: string;
  rendered_prompt: string;
  provider_spec_json: string;
  model_id: string;
  model_params_json: string;
  status: string;
  error_text: string | null;
  output_text: string | null;
  latency_ms: number | null;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  cost_estimate: number;
  created_at: number;
}

export interface RunWithVersion extends Run {
  version_number: number;
}

export interface RunListItem {
  id: number;
  prompt_version_id: number;
  version_number: number;
  status: string;
  latency_ms: number | null;
  created_at: number;
  input_preview: string;
  output_preview: string | null;
  error_text: string | null;
}

export interface CreateRunRequest {
  prompt_version_id: number;
  input_json: Record<string, any>;
  model_params: {
    model: string;
    temperature?: number;
    top_p?: number;
    max_tokens?: number;
    seed?: number;
    stop?: string[];
  };
}

// Prepared statements
const insertRunStmt = db.prepare(`
  INSERT INTO runs (
    prompt_version_id,
    input_json,
    input_hash,
    template_vars_json,
    rendered_prompt,
    provider_spec_json,
    model_id,
    model_params_json,
    status,
    error_text,
    output_text,
    latency_ms,
    prompt_tokens,
    completion_tokens
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  RETURNING *
`);

const getRunStmt = db.prepare('SELECT * FROM runs WHERE id = ?');

const getRunsForPromptStmt = db.prepare(`
  SELECT 
    r.*,
    pv.version_number
  FROM runs r
  JOIN prompt_versions pv ON r.prompt_version_id = pv.id
  WHERE pv.prompt_id = ?
  ORDER BY r.created_at DESC
  LIMIT ? OFFSET ?
`);

const getRunsForVersionStmt = db.prepare(`
  SELECT 
    r.*,
    pv.version_number
  FROM runs r
  JOIN prompt_versions pv ON r.prompt_version_id = pv.id
  WHERE r.prompt_version_id = ?
  ORDER BY r.created_at DESC
  LIMIT ? OFFSET ?
`);

const countRunsForPromptStmt = db.prepare(`
  SELECT COUNT(*) as total
  FROM runs r
  JOIN prompt_versions pv ON r.prompt_version_id = pv.id
  WHERE pv.prompt_id = ?
`);

const countRunsForVersionStmt = db.prepare(`
  SELECT COUNT(*) as total
  FROM runs r
  WHERE r.prompt_version_id = ?
`);

/**
 * Execute a new run
 */
export async function createRun(request: CreateRunRequest): Promise<Run> {
  // 1. Get the prompt version to access the content
  const version = getVersion(request.prompt_version_id);
  if (!version) {
    throw new Error(`Prompt version ${request.prompt_version_id} not found`);
  }

  // 2. Render the prompt with input variables
  const { renderedPrompt, templateVars } = renderPrompt(
    version.content,
    request.input_json
  );

  // 3. Generate input hash for deduplication
  const inputHash = generateInputHash(request.input_json);

  // 4. Prepare provider spec
  const providerSpec = {
    provider: 'ollama',
    base_url: OLLAMA_BASE_URL
  };

  // 5. Execute against Ollama
  const ollamaRequest: OllamaRunRequest = {
    model: request.model_params.model,
    prompt: renderedPrompt,
    temperature: request.model_params.temperature,
    top_p: request.model_params.top_p,
    max_tokens: request.model_params.max_tokens,
    seed: request.model_params.seed,
    stop: request.model_params.stop,
  };

  const ollamaResponse = await executeOllamaRun(renderedPrompt, ollamaRequest);

  // 6. Store the run with all metadata
  const run = insertRunStmt.get(
    request.prompt_version_id,
    JSON.stringify(request.input_json),
    inputHash,
    JSON.stringify(templateVars),
    renderedPrompt,
    JSON.stringify(providerSpec),
    request.model_params.model,
    JSON.stringify(request.model_params),
    ollamaResponse.status,
    ollamaResponse.errorText || null,
    ollamaResponse.output || null,
    ollamaResponse.latency,
    ollamaResponse.promptTokens || null,
    ollamaResponse.completionTokens || null
  ) as Run;

  return run;
}

/**
 * Get a run by ID
 */
export function getRun(runId: number): Run | undefined {
  return getRunStmt.get(runId) as Run | undefined;
}

/**
 * List runs for a prompt (across all versions)
 */
export function listRunsForPrompt(
  promptId: number,
  options: { limit?: number; offset?: number; versionId?: number } = {}
): { runs: RunListItem[]; total: number } {
  const limit = options.limit ?? 20;
  const offset = options.offset ?? 0;

  let runs: RunWithVersion[];
  let total: number;

  if (options.versionId) {
    // Filter by specific version
    runs = getRunsForVersionStmt.all(options.versionId, limit, offset) as RunWithVersion[];
    const countResult = countRunsForVersionStmt.get(options.versionId) as { total: number };
    total = countResult.total;
  } else {
    // All versions
    runs = getRunsForPromptStmt.all(promptId, limit, offset) as RunWithVersion[];
    const countResult = countRunsForPromptStmt.get(promptId) as { total: number };
    total = countResult.total;
  }

  // Transform to list items with previews
  const listItems: RunListItem[] = runs.map(run => {
    const inputObj = JSON.parse(run.input_json);
    const inputPreview = JSON.stringify(inputObj).substring(0, 100);
    const outputPreview = run.output_text ? run.output_text.substring(0, 100) : null;

    return {
      id: run.id,
      prompt_version_id: run.prompt_version_id,
      version_number: run.version_number,
      status: run.status,
      latency_ms: run.latency_ms,
      created_at: run.created_at,
      input_preview: inputPreview,
      output_preview: outputPreview,
      error_text: run.error_text
    };
  });

  return { runs: listItems, total };
}

/**
 * Re-run an existing run with exact same configuration
 */
export async function rerunRun(originalRunId: number): Promise<Run> {
  const original = getRun(originalRunId);
  if (!original) {
    throw new Error(`Run ${originalRunId} not found`);
  }

  // Extract original configuration
  const request: CreateRunRequest = {
    prompt_version_id: original.prompt_version_id,
    input_json: JSON.parse(original.input_json),
    model_params: JSON.parse(original.model_params_json)
  };

  // Execute new run with same config
  return createRun(request);
}
