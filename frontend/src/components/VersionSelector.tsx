import { PromptVersion } from '../api/client';

interface VersionSelectorProps {
  versions: PromptVersion[];
  currentVersionId: number | null;
  defaultVersionId: number | null;
  onVersionSelect: (version: PromptVersion) => void;
  onSetDefault: (versionId: number) => void;
}

export function VersionSelector({
  versions,
  currentVersionId,
  defaultVersionId,
  onVersionSelect,
  onSetDefault
}: VersionSelectorProps) {
  const currentVersion = versions.find(v => v.id === currentVersionId);
  const sortedVersions = [...versions].sort((a, b) => b.version_number - a.version_number);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = Date.now();
    const diff = now - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="version-selector">
      <div className="version-header">
        <h3>Version History</h3>
        <div className="version-info">
          {currentVersion && (
            <span className="current-version">
              v{currentVersion.version_number}
              {currentVersion.id === defaultVersionId && ' (default)'}
            </span>
          )}
        </div>
      </div>

      <div className="version-list">
        {sortedVersions.map(version => (
          <div
            key={version.id}
            className={`version-item ${version.id === currentVersionId ? 'active' : ''}`}
            onClick={() => onVersionSelect(version)}
          >
            <div className="version-item-header">
              <span className="version-number">v{version.version_number}</span>
              {version.id === defaultVersionId && (
                <span className="badge badge-default">default</span>
              )}
            </div>
            <div className="version-item-meta">
              <span className="version-time">{formatDate(version.created_at)}</span>
              {version.parent_version_id && (
                <span className="version-parent">
                  → from v{versions.find(v => v.id === version.parent_version_id)?.version_number}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {currentVersionId && currentVersionId !== defaultVersionId && (
        <div className="version-actions">
          <button
            className="btn btn-secondary"
            onClick={() => currentVersionId && onSetDefault(currentVersionId)}
          >
            Set as Default
          </button>
        </div>
      )}
    </div>
  );
}
