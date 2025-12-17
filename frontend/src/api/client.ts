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
