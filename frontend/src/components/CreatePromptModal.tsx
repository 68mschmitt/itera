import { useEffect, useState } from 'react';

interface CreatePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePrompt: (name: string, content: string) => Promise<void>;
  isLoading: boolean;
}

export function CreatePromptModal({
  isOpen,
  onClose,
  onCreatePrompt,
  isLoading,
}: CreatePromptModalProps) {
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    setValidationError(null);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const validateForm = (): boolean => {
    if (!name.trim()) {
      setValidationError('Prompt name is required');
      return false;
    }
    if (name.length > 200) {
      setValidationError('Prompt name must be less than 200 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    try {
      await onCreatePrompt(name.trim(), content.trim());
      setName('');
      setContent('');
      setValidationError(null);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create prompt');
    }
  };

  const handleClose = () => {
    setName('');
    setContent('');
    setError(null);
    setValidationError(null);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Prompt</h2>
          <button
            className="btn-close"
            onClick={handleClose}
            aria-label="Close modal"
            disabled={isLoading}
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="error-message">
                <strong>Error:</strong> {error}
              </div>
            )}

            <div className="form-section" style={{ marginBottom: '1rem' }}>
              <label htmlFor="prompt-name">Prompt Name *</label>
              <input
                id="prompt-name"
                type="text"
                value={name}
                onChange={handleNameChange}
                placeholder="e.g., Support Agent, Code Reviewer"
                disabled={isLoading}
                maxLength={200}
                autoFocus
              />
              {validationError && (
                <div style={{
                  color: '#dc3545',
                  fontSize: '0.875rem',
                  marginTop: '0.25rem',
                }}>
                  {validationError}
                </div>
              )}
              <div style={{
                fontSize: '0.75rem',
                color: '#6c757d',
                marginTop: '0.25rem',
              }}>
                {name.length}/200
              </div>
            </div>

            <div className="form-section" style={{ marginBottom: '1rem' }}>
              <label htmlFor="prompt-content">Initial Content (Optional)</label>
              <textarea
                id="prompt-content"
                value={content}
                onChange={handleContentChange}
                placeholder="Enter your prompt content here..."
                disabled={isLoading}
                style={{
                  width: '100%',
                  minHeight: '150px',
                  padding: '0.75rem',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  fontFamily: "'Monaco', 'Menlo', 'Courier New', monospace",
                  fontSize: '0.875rem',
                  resize: 'vertical',
                }}
              />
            </div>
          </form>
        </div>

        <div className="modal-footer">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !name.trim()}
            className="btn btn-primary"
          >
            {isLoading ? 'Creating...' : 'Create Prompt'}
          </button>
        </div>
      </div>
    </div>
  );
}
