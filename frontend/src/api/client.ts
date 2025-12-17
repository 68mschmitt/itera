import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface HealthResponse {
  status: string;
  timestamp: number;
  ollama: {
    status: 'connected' | 'error';
    baseUrl: string;
    error?: string;
  };
}

export async function getHealth(): Promise<HealthResponse> {
  const response = await api.get<HealthResponse>('/health');
  return response.data;
}

export async function getModels() {
  const response = await api.get('/api/models');
  return response.data;
}

// Prompt Types
export interface Prompt {
  id: number;
  name: string;
  created_at: number;
  default_version_id: number | null;
}

export interface PromptListItem {
  id: number;
  name: string;
  createdAt: number;
  versionCount: number;
  lastModified: number;
}

export interface PromptVersion {
  id: number;
  prompt_id: number;
  version_number: number;
  content: string;
  parent_version_id: number | null;
  created_at: number;
  is_default?: boolean;
}

export interface PromptWithVersions extends Prompt {
  versions: PromptVersion[];
}

export interface DiffPart {
  type: 'added' | 'removed' | 'unchanged';
  value: string;
}

export interface VersionDiff {
  version_a: {
    id: number;
    version_number: number;
    content: string;
  };
  version_b: {
    id: number;
    version_number: number;
    content: string;
  };
  diff: DiffPart[];
}

// Prompt API Methods

export async function listPrompts(): Promise<PromptListItem[]> {
  const response = await api.get<PromptListItem[]>('/api/prompts');
  return response.data;
}

export async function createPrompt(name: string, content?: string): Promise<Prompt> {
  const response = await api.post<Prompt>('/api/prompts', { name, content });
  return response.data;
}

export async function getPrompt(id: number): Promise<PromptWithVersions> {
  const response = await api.get<PromptWithVersions>(`/api/prompts/${id}`);
  return response.data;
}

export async function deletePrompt(id: number): Promise<void> {
  await api.delete(`/api/prompts/${id}`);
}

export async function createVersion(promptId: number, content: string): Promise<PromptVersion> {
  const response = await api.post<PromptVersion>(`/api/prompts/${promptId}/versions`, { content });
  return response.data;
}

export async function setDefaultVersion(promptId: number, versionId: number): Promise<Prompt> {
  const response = await api.put<Prompt>(`/api/prompts/${promptId}/default`, { version_id: versionId });
  return response.data;
}

export async function getVersionDiff(promptId: number, version1Id: number, version2Id: number): Promise<VersionDiff> {
  const response = await api.get<VersionDiff>(`/api/prompts/${promptId}/versions/${version1Id}/${version2Id}/diff`);
  return response.data;
}

// Run Types
export interface Run {
  id: number;
  prompt_version_id: number;
  input_json: Record<string, any>;
  input_hash: string;
  template_vars_json: Record<string, any>;
  rendered_prompt: string;
  provider_spec_json: Record<string, any>;
  model_id: string;
  model_params_json: Record<string, any>;
  status: 'success' | 'error';
  error_text: string | null;
  output_text: string | null;
  latency_ms: number | null;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  cost_estimate: number;
  created_at: number;
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

export interface RunsListResponse {
  runs: RunListItem[];
  total: number;
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

// Run API Methods

export async function createRun(request: CreateRunRequest): Promise<Run> {
  const response = await api.post<Run>('/api/runs', request);
  return response.data;
}

export async function listRunsForPrompt(
  promptId: number,
  options?: { limit?: number; offset?: number; versionId?: number }
): Promise<RunsListResponse> {
  const params = new URLSearchParams();
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.offset) params.append('offset', options.offset.toString());
  if (options?.versionId) params.append('version_id', options.versionId.toString());
  
  const response = await api.get<RunsListResponse>(
    `/api/prompts/${promptId}/runs?${params.toString()}`
  );
  return response.data;
}

export async function getRun(runId: number): Promise<Run> {
  const response = await api.get<Run>(`/api/runs/${runId}`);
  return response.data;
}

export async function rerunRun(runId: number): Promise<Run> {
  const response = await api.post<Run>(`/api/runs/${runId}/rerun`);
  return response.data;
}
