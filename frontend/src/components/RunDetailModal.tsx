import { useState, useEffect } from 'react';
import { Run, getRun, rerunRun } from '../api/client';

interface RunDetailModalProps {
  runId: number;
  onClose: () => void;
  onRerunComplete?: (newRunId: number) => void;
}

type TabType = 'input' | 'rendered' | 'output' | 'metadata';

export function RunDetailModal({ runId, onClose, onRerunComplete }: RunDetailModalProps) {
  const [run, setRun] = useState<Run | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('output');
  const [isRerunning, setIsRerunning] = useState(false);

  useEffect(() => {
    loadRun();
  }, [runId]);

  const loadRun = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRun(runId);
      setRun(data);
    } catch (err) {
      console.error('Failed to load run:', err);
      setError('Failed to load run details');
    } finally {
      setLoading(false);
    }
  };

  const handleRerun = async () => {
    if (!run) return;
    
    setIsRerunning(true);
    try {
      const newRun = await rerunRun(run.id);
      if (onRerunComplete) {
        onRerunComplete(newRun.id);
      }
      onClose();
    } catch (err) {
      console.error('Failed to rerun:', err);
      alert('Failed to rerun prompt');
    } finally {
      setIsRerunning(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadAsJson = () => {
    if (!run) return;
    
    const dataStr = JSON.stringify(run, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `run-${run.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-loading">Loading run details...</div>
        </div>
      </div>
    );
  }

  if (error || !run) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-error">{error || 'Run not found'}</div>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content run-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Run #{run.id} Details</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-tabs">
          <button
            className={`tab-button ${activeTab === 'input' ? 'active' : ''}`}
            onClick={() => setActiveTab('input')}
          >
            Input
          </button>
          <button
            className={`tab-button ${activeTab === 'rendered' ? 'active' : ''}`}
            onClick={() => setActiveTab('rendered')}
          >
            Rendered
          </button>
          <button
            className={`tab-button ${activeTab === 'output' ? 'active' : ''}`}
            onClick={() => setActiveTab('output')}
          >
            Output
          </button>
          <button
            className={`tab-button ${activeTab === 'metadata' ? 'active' : ''}`}
            onClick={() => setActiveTab('metadata')}
          >
            Metadata
          </button>
        </div>

        <div className="modal-body">
          {activeTab === 'input' && (
            <div className="tab-content">
              <div className="content-header">
                <h3>Input JSON</h3>
                <button
                  className="btn-copy"
                  onClick={() => copyToClipboard(JSON.stringify(run.input_json, null, 2))}
                >
                  Copy
                </button>
              </div>
              <pre className="code-block">
                {JSON.stringify(run.input_json, null, 2)}
              </pre>
            </div>
          )}

          {activeTab === 'rendered' && (
            <div className="tab-content">
              <div className="content-header">
                <h3>Rendered Prompt</h3>
                <button
                  className="btn-copy"
                  onClick={() => copyToClipboard(run.rendered_prompt)}
                >
                  Copy
                </button>
              </div>
              <pre className="code-block">{run.rendered_prompt}</pre>
            </div>
          )}

          {activeTab === 'output' && (
            <div className="tab-content">
              <div className="content-header">
                <h3>Output</h3>
                {run.output_text && (
                  <button
                    className="btn-copy"
                    onClick={() => copyToClipboard(run.output_text!)}
                  >
                    Copy
                  </button>
                )}
              </div>
              {run.status === 'error' ? (
                <div className="error-output">
                  <strong>Error:</strong> {run.error_text}
                </div>
              ) : (
                <pre className="code-block">{run.output_text}</pre>
              )}
            </div>
          )}

          {activeTab === 'metadata' && (
            <div className="tab-content metadata-content">
              <div className="metadata-section">
                <h3>Status</h3>
                <span className={`status-badge status-${run.status}`}>
                  {run.status}
                </span>
              </div>

              <div className="metadata-section">
                <h3>Model</h3>
                <p>{run.model_id}</p>
              </div>

              <div className="metadata-section">
                <h3>Model Parameters</h3>
                <pre className="code-block small">
                  {JSON.stringify(run.model_params_json, null, 2)}
                </pre>
              </div>

              <div className="metadata-section">
                <h3>Metrics</h3>
                <dl className="metadata-list">
                  <dt>Latency:</dt>
                  <dd>{run.latency_ms ? `${run.latency_ms}ms` : '-'}</dd>
                  
                  <dt>Prompt Tokens:</dt>
                  <dd>{run.prompt_tokens || '-'}</dd>
                  
                  <dt>Completion Tokens:</dt>
                  <dd>{run.completion_tokens || '-'}</dd>
                  
                  <dt>Input Hash:</dt>
                  <dd className="hash-value">{run.input_hash.substring(0, 16)}...</dd>
                  
                  <dt>Created:</dt>
                  <dd>{formatDate(run.created_at)}</dd>
                </dl>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            className="btn btn-secondary"
            onClick={downloadAsJson}
          >
            Download JSON
          </button>
          <button
            className="btn btn-primary"
            onClick={handleRerun}
            disabled={isRerunning}
          >
            {isRerunning ? 'Re-running...' : 'Re-run This Run'}
          </button>
        </div>
      </div>
    </div>
  );
}
