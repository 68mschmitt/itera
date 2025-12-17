import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PromptWithVersions, PromptVersion, createVersion, getPrompt, setDefaultVersion as apiSetDefaultVersion } from '../api/client';
import { PromptEditor } from '../components/PromptEditor';
import { VersionSelector } from '../components/VersionSelector';
import { VersionLineage } from '../components/VersionLineage';
import { DiffModal } from '../components/DiffModal';

export function PromptPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [prompt, setPrompt] = useState<PromptWithVersions | null>(null);
  const [currentVersion, setCurrentVersion] = useState<PromptVersion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDiff, setShowDiff] = useState(false);
  const [diffVersionId, setDiffVersionId] = useState<number | null>(null);

  useEffect(() => {
    loadPrompt();
  }, [id]);

  const loadPrompt = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getPrompt(parseInt(id));
      setPrompt(data);
      
      // Set current version to default if available
      if (data.default_version_id) {
        const defaultVersion = data.versions.find(v => v.id === data.default_version_id);
        if (defaultVersion) {
          setCurrentVersion(defaultVersion);
        }
      }
    } catch (err) {
      console.error('Failed to load prompt:', err);
      setError('Failed to load prompt');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveVersion = async (content: string) => {
    if (!prompt) return;
    
    try {
      const newVersion = await createVersion(prompt.id, content);
      
      // Reload prompt to get updated state
      await loadPrompt();
      
      // Set current version to the new version
      const updatedPrompt = await getPrompt(prompt.id);
      const latestVersion = updatedPrompt.versions.find(v => v.id === newVersion.id);
      if (latestVersion) {
        setCurrentVersion(latestVersion);
      }
    } catch (err) {
      console.error('Failed to create version:', err);
      throw err;
    }
  };

  const handleVersionSelect = (version: PromptVersion) => {
    setCurrentVersion(version);
  };

  const handleSetDefault = async (versionId: number) => {
    if (!prompt) return;
    
    try {
      await apiSetDefaultVersion(prompt.id, versionId);
      await loadPrompt();
      
      // Keep current version selected
      const updatedPrompt = await getPrompt(prompt.id);
      const version = updatedPrompt.versions.find(v => v.id === versionId);
      if (version) {
        setCurrentVersion(version);
      }
    } catch (err) {
      console.error('Failed to set default version:', err);
      alert('Failed to set default version');
    }
  };

  const handleShowDiff = (versionId: number) => {
    if (!currentVersion) return;
    setDiffVersionId(versionId);
    setShowDiff(true);
  };

  const handleCloseDiff = () => {
    setShowDiff(false);
    setDiffVersionId(null);
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading prompt...</div>
      </div>
    );
  }

  if (error || !prompt) {
    return (
      <div className="page-container">
        <div className="error">{error || 'Prompt not found'}</div>
        <button className="btn btn-secondary" onClick={() => navigate('/')}>
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="page-container prompt-page">
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate('/')}>
          ← Back
        </button>
        <h1>{prompt.name}</h1>
      </div>

      <div className="prompt-content">
        <div className="prompt-main">
          <PromptEditor
            content={currentVersion?.content || ''}
            onSave={handleSaveVersion}
            readOnly={!currentVersion}
          />
          
          <div className="version-history-section">
            <div className="history-header">
              <h3>Version History</h3>
            </div>
            
            <div className="history-list">
              {prompt.versions
                .sort((a, b) => b.version_number - a.version_number)
                .map(version => (
                  <div
                    key={version.id}
                    className={`history-item ${version.id === currentVersion?.id ? 'active' : ''}`}
                    onClick={() => handleVersionSelect(version)}
                  >
                    <div className="history-item-header">
                      <span className="version-number">v{version.version_number}</span>
                      {version.is_default && (
                        <span className="badge badge-default">default</span>
                      )}
                    </div>
                    
                    {prompt.default_version_id && version.id !== prompt.default_version_id && (
                      <button
                        className="btn-diff"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShowDiff(version.id);
                        }}
                      >
                        View Diff
                      </button>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="prompt-sidebar">
          <VersionSelector
            versions={prompt.versions}
            currentVersionId={currentVersion?.id || null}
            defaultVersionId={prompt.default_version_id}
            onVersionSelect={handleVersionSelect}
            onSetDefault={handleSetDefault}
          />
          
          <VersionLineage
            versions={prompt.versions}
            currentVersionId={currentVersion?.id || null}
            defaultVersionId={prompt.default_version_id}
          />
        </div>
      </div>

      {showDiff && currentVersion && diffVersionId && (
        <DiffModal
          promptId={prompt.id}
          version1Id={diffVersionId}
          version2Id={currentVersion.id}
          onClose={handleCloseDiff}
        />
      )}
    </div>
  );
}
