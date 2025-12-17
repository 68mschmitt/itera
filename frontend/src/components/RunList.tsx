import { RunListItem } from '../api/client';

interface RunListProps {
  runs: RunListItem[];
  onRunClick: (runId: number) => void;
}

export function RunList({ runs, onRunClick }: RunListProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const formatLatency = (ms: number | null) => {
    if (ms === null) return '-';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  if (runs.length === 0) {
    return (
      <div className="run-list-empty">
        <p>No runs yet. Execute a prompt to see results here.</p>
      </div>
    );
  }

  return (
    <div className="run-list">
      <table className="runs-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Status</th>
            <th>Version</th>
            <th>Latency</th>
            <th>Input Preview</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {runs.map(run => (
            <tr
              key={run.id}
              className="run-row"
              onClick={() => onRunClick(run.id)}
            >
              <td className="run-id">#{run.id}</td>
              <td>
                <span className={`status-badge status-${run.status}`}>
                  {run.status === 'success' ? '✓' : '✗'}
                </span>
              </td>
              <td className="version-cell">v{run.version_number}</td>
              <td className="latency-cell">{formatLatency(run.latency_ms)}</td>
              <td className="preview-cell">
                {run.status === 'error' && run.error_text ? (
                  <span className="error-preview">{run.error_text.substring(0, 50)}</span>
                ) : (
                  run.input_preview
                )}
              </td>
              <td className="date-cell">{formatDate(run.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
