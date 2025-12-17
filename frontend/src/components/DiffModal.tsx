import { useEffect, useState } from 'react';
import { VersionDiff, getVersionDiff } from '../api/client';

interface DiffModalProps {
  promptId: number;
  version1Id: number;
  version2Id: number;
  onClose: () => void;
}

export function DiffModal({ promptId, version1Id, version2Id, onClose }: DiffModalProps) {
  const [diff, setDiff] = useState<VersionDiff | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDiff();
  }, [promptId, version1Id, version2Id]);

  const loadDiff = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getVersionDiff(promptId, version1Id, version2Id);
      setDiff(result);
    } catch (err) {
      console.error('Failed to load diff:', err);
      setError('Failed to load version comparison');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content diff-modal">
        <div className="modal-header">
          <h2>
            Comparing v{diff?.version_a.version_number} → v{diff?.version_b.version_number}
          </h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {loading && <div className="loading">Loading diff...</div>}
          
          {error && <div className="error">{error}</div>}
          
          {diff && !loading && !error && (
            <div className="diff-view">
              <div className="diff-content">
                {diff.diff.map((part, index) => (
                  <span
                    key={index}
                    className={`diff-part diff-${part.type}`}
                  >
                    {part.value}
                  </span>
                ))}
              </div>
              
              <div className="diff-legend">
                <div className="legend-item">
                  <span className="diff-part diff-added">Added text</span>
                </div>
                <div className="legend-item">
                  <span className="diff-part diff-removed">Removed text</span>
                </div>
                <div className="legend-item">
                  <span className="diff-part diff-unchanged">Unchanged text</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
