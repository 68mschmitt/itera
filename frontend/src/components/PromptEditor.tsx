import { useState, useEffect, useRef } from 'react';

interface PromptEditorProps {
  content: string;
  onSave: (content: string) => Promise<void>;
  readOnly?: boolean;
}

export function PromptEditor({ content: initialContent, onSave, readOnly = false }: PromptEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const prevInitialContentRef = useRef(initialContent);

  // Update content when initialContent prop changes (e.g., when switching versions)
  // Only reset if the value actually changed to prevent interrupting user input
  useEffect(() => {
    if (prevInitialContentRef.current !== initialContent) {
      setContent(initialContent);
      setIsDirty(false);
      prevInitialContentRef.current = initialContent;
    }
  }, [initialContent]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setIsDirty(e.target.value !== initialContent);
  };

  const handleSave = async () => {
    if (!isDirty || isSaving) return;
    
    setIsSaving(true);
    try {
      await onSave(content);
      setIsDirty(false);
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save version');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="prompt-editor">
      <div className="editor-header">
        <h3>Prompt Content</h3>
        <div className="editor-stats">
          <span className="char-count">{content.length} characters</span>
          {isDirty && <span className="dirty-indicator">• Unsaved changes</span>}
        </div>
      </div>
      
      <textarea
        className="editor-textarea"
        value={content}
        onChange={handleChange}
        readOnly={readOnly}
        placeholder="Enter your prompt content here..."
        rows={15}
      />
      
      <div className="editor-actions">
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={!isDirty || isSaving || readOnly}
        >
          {isSaving ? 'Saving...' : 'Save as New Version'}
        </button>
      </div>
    </div>
  );
}
