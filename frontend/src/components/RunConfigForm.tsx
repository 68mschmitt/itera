import { useState, useEffect } from 'react';
import { createRun, CreateRunRequest, getModels } from '../api/client';

interface RunConfigFormProps {
  promptVersionId: number;
  promptContent: string;
  onRunComplete: (runId: number) => void;
}

export function RunConfigForm({ promptVersionId, promptContent, onRunComplete }: RunConfigFormProps) {
  const [inputJson, setInputJson] = useState('{}');
  const [model, setModel] = useState('llama3.1:8b');
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(0.9);
  const [maxTokens, setMaxTokens] = useState(2000);
  const [seed, setSeed] = useState<number | ''>('');
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [models, setModels] = useState<any[]>([]);
  const [requiredVars, setRequiredVars] = useState<string[]>([]);

  // Load available models
  useEffect(() => {
    loadModels();
  }, []);

  // Extract required variables from prompt content
  useEffect(() => {
    const regex = /\{(\w+)\}/g;
    const matches = promptContent.matchAll(regex);
    const vars = Array.from(matches, m => m[1]);
    setRequiredVars([...new Set(vars)]);
  }, [promptContent]);

  const loadModels = async () => {
    try {
      const data = await getModels();
      setModels(data.models || []);
      if (data.models && data.models.length > 0 && !model) {
        setModel(data.models[0].name);
      }
    } catch (err) {
      console.error('Failed to load models:', err);
    }
  };

  const validateInputJson = (): Record<string, any> | null => {
    try {
      const parsed = JSON.parse(inputJson);
      
      // Check for required variables
      const missing = requiredVars.filter(v => parsed[v] === undefined);
      if (missing.length > 0) {
        setError(`Missing required variables: ${missing.join(', ')}`);
        return null;
      }
      
      return parsed;
    } catch (err) {
      setError('Invalid JSON format');
      return null;
    }
  };

  const handleRun = async () => {
    setError(null);
    
    const parsedInput = validateInputJson();
    if (!parsedInput) return;

    setIsRunning(true);
    
    try {
      const request: CreateRunRequest = {
        prompt_version_id: promptVersionId,
        input_json: parsedInput,
        model_params: {
          model,
          temperature,
          top_p: topP,
          max_tokens: maxTokens,
          seed: seed === '' ? undefined : seed as number
        }
      };
      
      const run = await createRun(request);
      onRunComplete(run.id);
    } catch (err: any) {
      console.error('Failed to create run:', err);
      setError(err.response?.data?.error || 'Failed to execute run');
    } finally {
      setIsRunning(false);
    }
  };

  const inputIsValid = () => {
    try {
      const parsed = JSON.parse(inputJson);
      const missing = requiredVars.filter(v => parsed[v] === undefined);
      return missing.length === 0;
    } catch {
      return false;
    }
  };

  return (
    <div className="run-config-form">
      <h3>Run Prompt</h3>
      
      <div className="form-section">
        <label>Input JSON</label>
        <textarea
          className="json-input"
          value={inputJson}
          onChange={(e) => setInputJson(e.target.value)}
          placeholder='{"variable": "value"}'
          rows={6}
        />
        
        {requiredVars.length > 0 && (
          <div className="required-vars">
            <span>Required variables: </span>
            {requiredVars.map(v => (
              <span key={v} className={`var-badge ${inputIsValid() || inputJson === '{}' ? '' : 'missing'}`}>
                {v}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="form-section">
        <label>Model</label>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          disabled={isRunning}
        >
          {models.map(m => (
            <option key={m.name} value={m.name}>{m.name}</option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <div className="form-field">
          <label>Temperature</label>
          <input
            type="number"
            min="0"
            max="2"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            disabled={isRunning}
          />
        </div>

        <div className="form-field">
          <label>Top P</label>
          <input
            type="number"
            min="0"
            max="1"
            step="0.1"
            value={topP}
            onChange={(e) => setTopP(parseFloat(e.target.value))}
            disabled={isRunning}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-field">
          <label>Max Tokens</label>
          <input
            type="number"
            min="1"
            max="100000"
            step="100"
            value={maxTokens}
            onChange={(e) => setMaxTokens(parseInt(e.target.value))}
            disabled={isRunning}
          />
        </div>

        <div className="form-field">
          <label>Seed (optional)</label>
          <input
            type="number"
            value={seed}
            onChange={(e) => setSeed(e.target.value === '' ? '' : parseInt(e.target.value))}
            placeholder="Random"
            disabled={isRunning}
          />
        </div>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      <button
        className="btn btn-primary run-button"
        onClick={handleRun}
        disabled={isRunning || !inputIsValid()}
      >
        {isRunning ? 'Running...' : 'Run Prompt'}
      </button>
    </div>
  );
}
