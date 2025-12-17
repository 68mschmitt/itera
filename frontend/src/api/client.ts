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

export async function createPrompt(name: string): Promise<Prompt> {
  const response = await api.post<Prompt>('/api/prompts', { name });
  return response.data;
}

export async function getPrompt(id: number): Promise<PromptWithVersions> {
  const response = await api.get<PromptWithVersions>(`/api/prompts/${id}`);
  return response.data;
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
