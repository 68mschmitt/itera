import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPrompt, createVersion, PromptWithVersions } from '../api/client';

export function PromptDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const promptId = parseInt(id || '0', 10);

  const [prompt, setPrompt] = useState<PromptWithVersions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    fetchPrompt();
  }, [promptId]);

  useEffect(() => {
    if (prompt && prompt.versions.length > 0) {
      const defaultVersionId =
        prompt.default_version_id || prompt.versions[prompt.versions.length - 1].id;
      setSelectedVersionId(defaultVersionId);
      const selectedVersion = prompt.versions.find((v) => v.id === defaultVersionId);
      if (selectedVersion) {
        setEditedContent(selectedVersion.content);
      }
    }
  }, [prompt]);

  const fetchPrompt = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPrompt(promptId);
      setPrompt(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch prompt');
      console.error('Failed to fetch prompt:', err);
    } finally {
      setLoading(false);
    }
  };

   const handleSaveVersion = async () => {
     if (!prompt) {
       setIsEditMode(false);
       return;
     }

     const currentVersion = prompt.versions.find((v) => v.id === selectedVersionId);
     if (!currentVersion || editedContent.trim() === currentVersion.content.trim()) {
       setIsEditMode(false);
       return;
     }

     setSaveError(null);
     setIsSaving(true);
     try {
       const newVersion = await createVersion(promptId, editedContent);
       await fetchPrompt();
       setSelectedVersionId(newVersion.id);
       setIsEditMode(false);
     } catch (err) {
       setSaveError(err instanceof Error ? err.message : 'Failed to save version');
       console.error('Failed to save version:', err);
     } finally {
       setIsSaving(false);
     }
   };

  const handleCancel = () => {
    if (prompt && selectedVersionId) {
      const selectedVersion = prompt.versions.find((v) => v.id === selectedVersionId);
      if (selectedVersion) {
        setEditedContent(selectedVersion.content);
      }
    }
    setIsEditMode(false);
  };

  const handleVersionChange = (versionId: number) => {
    setSelectedVersionId(versionId);
    const selectedVersion = prompt?.versions.find((v) => v.id === versionId);
    if (selectedVersion) {
      setEditedContent(selectedVersion.content);
    }
    setIsEditMode(false);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="loading">
        <p>Loading prompt...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <button
          onClick={() => navigate('/prompts')}
          className="btn btn-back"
          style={{ marginBottom: '1rem' }}
        >
          ← Back to Prompts
        </button>
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div>
        <button
          onClick={() => navigate('/prompts')}
          className="btn btn-back"
          style={{ marginBottom: '1rem' }}
        >
          ← Back to Prompts
        </button>
        <div className="error-message">Prompt not found</div>
      </div>
    );
  }

  const selectedVersion = prompt.versions.find((v) => v.id === selectedVersionId);

  return (
    <div className="prompt-page">
      <button
        onClick={() => navigate('/prompts')}
        className="btn btn-back"
        style={{ marginBottom: '1rem' }}
      >
        ← Back to Prompts
      </button>

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: '0 0 0.5rem 0' }}>{prompt.name}</h1>
        <p style={{ margin: 0, color: '#6c757d', fontSize: '0.875rem' }}>
          {prompt.versions.length} version{prompt.versions.length !== 1 ? 's' : ''} · Created{' '}
          {formatDate(prompt.versions[0]?.created_at || 0)}
        </p>
      </div>

      <div className="prompt-content">
        <div className="prompt-main">
          {saveError && (
            <div className="error-message" style={{ marginBottom: '1rem' }}>
              <strong>Error:</strong> {saveError}
            </div>
          )}

          <div className="prompt-editor">
            <div className="editor-header">
              <h3 style={{ margin: 0 }}>
                {isEditMode ? 'Edit Content' : 'Current Version'}
              </h3>
              {isEditMode && (
                <span className="dirty-indicator">● Editing</span>
              )}
            </div>

            {isEditMode ? (
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="editor-textarea"
                disabled={isSaving}
              />
            ) : (
              <pre
                style={{
                  background: '#f8f9fa',
                  padding: '1rem',
                  borderRadius: '4px',
                  overflow: 'auto',
                  maxHeight: '400px',
                  margin: 0,
                  fontSize: '0.875rem',
                  fontFamily: "'Monaco', 'Menlo', 'Courier New', monospace",
                  border: '1px solid #dee2e6',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {selectedVersion?.content || 'No content'}
              </pre>
            )}

            <div className="editor-actions">
              {isEditMode ? (
                <>
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveVersion}
                    disabled={isSaving}
                    className="btn btn-primary"
                  >
                    {isSaving ? 'Saving...' : 'Save as New Version'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditMode(true)}
                  className="btn btn-primary"
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="prompt-sidebar">
          <div className="version-history-section">
            <div className="history-header">
              <h3>Versions</h3>
            </div>

            {prompt.versions.length === 0 ? (
              <p style={{ color: '#6c757d', fontSize: '0.875rem', margin: 0 }}>
                No versions yet
              </p>
            ) : (
              <div className="history-list">
                {[...prompt.versions].reverse().map((version) => (
                  <div
                    key={version.id}
                    onClick={() => handleVersionChange(version.id)}
                    className={`history-item ${
                      selectedVersionId === version.id ? 'active' : ''
                    }`}
                  >
                    <div className="history-item-header">
                      <span style={{ fontWeight: 500 }}>
                        v{version.version_number}
                      </span>
                      {version.id === prompt.default_version_id && (
                        <span className="badge badge-default">Default</span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: '#6c757d',
                        marginTop: '0.25rem',
                      }}
                    >
                      {formatDate(version.created_at)}
                    </div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: '#6c757d',
                        marginTop: '0.25rem',
                      }}
                    >
                      {version.content.length} chars
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
