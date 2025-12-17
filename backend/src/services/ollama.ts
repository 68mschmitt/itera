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

/**
 * Model parameters for Ollama run execution
 */
export interface OllamaRunRequest {
  model: string;
  prompt: string;
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  stop?: string[];
  seed?: number;
  stream?: boolean;
}

/**
 * Response from Ollama execution
 */
export interface OllamaResponse {
  status: 'success' | 'error';
  output?: string;
  errorText?: string;
  latency: number;
  promptTokens?: number;
  completionTokens?: number;
}

/**
 * Execute a prompt against Ollama with complete audit trail
 */
export async function executeOllamaRun(
  renderedPrompt: string,
  modelParams: OllamaRunRequest
): Promise<OllamaResponse> {
  const startTime = Date.now();
  
  try {
    const response = await axios.post(
      `${OLLAMA_BASE_URL_ITERA}/api/generate`,
      {
        model: modelParams.model,
        prompt: renderedPrompt,
        temperature: modelParams.temperature ?? 0.7,
        top_p: modelParams.top_p ?? 0.9,
        options: {
          num_predict: modelParams.max_tokens ?? 2000,
          stop: modelParams.stop,
          seed: modelParams.seed,
        },
        stream: false
      },
      {
        timeout: 60000 // 60 second timeout
      }
    );
    
    const latency = Date.now() - startTime;
    
    return {
      status: 'success',
      output: response.data.response,
      latency,
      promptTokens: response.data.prompt_eval_count,
      completionTokens: response.data.eval_count,
    };
  } catch (error: any) {
    return {
      status: 'error',
      errorText: error.message || 'Unknown error occurred',
      latency: Date.now() - startTime,
    };
  }
}
