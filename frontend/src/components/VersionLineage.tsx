import { PromptVersion } from '../api/client';

interface VersionLineageProps {
  versions: PromptVersion[];
  currentVersionId: number | null;
  defaultVersionId: number | null;
}

export function VersionLineage({ versions, currentVersionId, defaultVersionId }: VersionLineageProps) {
  // Sort versions by version number
  const sortedVersions = [...versions].sort((a, b) => a.version_number - b.version_number);
  
  // Build a tree structure based on parent relationships
  const buildLineage = () => {
    const lines: JSX.Element[] = [];
    const versionMap = new Map(versions.map(v => [v.id, v]));
    
    sortedVersions.forEach((version, index) => {
      const isDefault = version.id === defaultVersionId;
      const isCurrent = version.id === currentVersionId;
      const parent = version.parent_version_id ? versionMap.get(version.parent_version_id) : null;
      
      const badges = [];
      if (isDefault) badges.push('default');
      if (isCurrent) badges.push('current');
      
      lines.push(
        <div key={version.id} className="lineage-item">
          <div className="lineage-connector">
            {index > 0 && <div className="connector-line" />}
            <div className="connector-dot" />
            {index < sortedVersions.length - 1 && <div className="connector-line" />}
          </div>
          
          <div className={`lineage-content ${isCurrent ? 'active' : ''}`}>
            <span className="version-label">v{version.version_number}</span>
            
            {badges.length > 0 && (
              <div className="lineage-badges">
                {badges.map(badge => (
                  <span key={badge} className={`badge badge-${badge}`}>
                    {badge}
                  </span>
                ))}
              </div>
            )}
            
            {parent && (
              <span className="lineage-parent">← from v{parent.version_number}</span>
            )}
          </div>
        </div>
      );
    });
    
    return lines;
  };

  return (
    <div className="version-lineage">
      <h3>Version Lineage</h3>
      <div className="lineage-tree">
        {buildLineage()}
      </div>
    </div>
  );
}
