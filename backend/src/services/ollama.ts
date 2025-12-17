import axios from 'axios';

const OLLAMA_BASE_URL_ITERA = process.env.OLLAMA_BASE_URL_ITERA || 'http://localhost:11434';

export interface OllamaHealthStatus {
  status: 'connected' | 'error';
  baseUrl: string;
  error?: string;
}

export async function checkOllamaHealth(): Promise<OllamaHealthStatus> {
  try {
    const response = await axios.get(`${OLLAMA_BASE_URL_ITERA}/api/tags`, {
      timeout: 5000
    });
    
    if (response.status === 200) {
      return {
        status: 'connected',
        baseUrl: OLLAMA_BASE_URL_ITERA
      };
    }
    
    return {
      status: 'error',
      baseUrl: OLLAMA_BASE_URL_ITERA,
      error: `Unexpected status code: ${response.status}`
    };
  } catch (error: any) {
    return {
      status: 'error',
      baseUrl: OLLAMA_BASE_URL_ITERA,
      error: error.message || 'Failed to connect to Ollama'
    };
  }
}

export async function listOllamaModels() {
  try {
    const response = await axios.get(`${OLLAMA_BASE_URL_ITERA}/api/tags`, {
      timeout: 5000
    });
    
    return response.data.models || [];
  } catch (error: any) {
    throw new Error(`Failed to list Ollama models: ${error.message}`);
  }
}
