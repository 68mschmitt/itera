import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHealth, HealthResponse, createPrompt } from '../api/client';

export function Home() {
  const navigate = useNavigate();
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [promptName, setPromptName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    async function fetchHealth() {
      try {
        const data = await getHealth();
        setHealth(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to connect to backend');
      } finally {
        setLoading(false);
      }
    }

    fetchHealth();
  }, []);

  const handleCreatePrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptName.trim()) return;
    
    setCreating(true);
    try {
      const prompt = await createPrompt(promptName.trim());
      navigate(`/prompts/${prompt.id}`);
    } catch (err) {
      console.error('Failed to create prompt:', err);
      alert('Failed to create prompt');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <h2 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Welcome to Itera</h2>
      
      <div style={{
        background: 'white',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        padding: '1.5rem',
        marginBottom: '1.5rem',
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Create New Prompt</h3>
        <form onSubmit={handleCreatePrompt} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={promptName}
            onChange={(e) => setPromptName(e.target.value)}
            placeholder="Enter prompt name (e.g., Support Agent)"
            style={{
              flex: 1,
              padding: '0.5rem',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              fontSize: '0.875rem',
            }}
          />
          <button
            type="submit"
            disabled={creating || !promptName.trim()}
            className="btn btn-primary"
          >
            {creating ? 'Creating...' : 'Create Prompt'}
          </button>
        </form>
      </div>
      
      <div style={{
        background: 'white',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        padding: '1.5rem',
        marginBottom: '1.5rem',
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>System Status</h3>
        
        {loading && <p>Checking connection...</p>}
        
        {error && (
          <div style={{
            background: '#f8d7da',
            color: '#721c24',
            padding: '1rem',
            borderRadius: '4px',
            marginBottom: '1rem',
          }}>
            <strong>Backend Connection Failed:</strong> {error}
          </div>
        )}
        
        {health && (
          <>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{
                  display: 'inline-block',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: '#28a745',
                  marginRight: '0.5rem',
                }} />
                <strong>Backend:</strong>
                <span style={{ marginLeft: '0.5rem' }}>Connected</span>
              </div>
            </div>
            
            <div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{
                  display: 'inline-block',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: health.ollama.status === 'connected' ? '#28a745' : '#dc3545',
                  marginRight: '0.5rem',
                }} />
                <strong>Ollama:</strong>
                <span style={{ marginLeft: '0.5rem' }}>
                  {health.ollama.status === 'connected' ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6c757d', marginLeft: '1.5rem' }}>
                URL: {health.ollama.baseUrl}
              </div>
              {health.ollama.error && (
                <div style={{
                  fontSize: '0.875rem',
                  color: '#dc3545',
                  marginLeft: '1.5rem',
                  marginTop: '0.25rem',
                }}>
                  Error: {health.ollama.error}
                </div>
              )}
            </div>
          </>
        )}
      </div>
      
      <div style={{
        background: '#d4edda',
        border: '1px solid #c3e6cb',
        borderRadius: '8px',
        padding: '1.5rem',
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '0.5rem' }}>✓ Phase 1 Complete: Prompt Versioning</h3>
        <ul style={{ marginBottom: 0, paddingLeft: '1.5rem' }}>
          <li>Create prompts with names and content</li>
          <li>Auto-incrementing versions (v1, v2, v3...)</li>
          <li>Parent tracking for version lineage</li>
          <li>View diffs between any two versions</li>
          <li>Rollback to previous versions</li>
          <li>Visual version history and lineage tree</li>
          <li>All operations are transactional and thread-safe</li>
        </ul>
        <p style={{ marginTop: '1rem', marginBottom: 0, fontWeight: 500, color: '#155724' }}>
          Ready for Phase 2: Reproducible Runs with Ollama
        </p>
      </div>
    </div>
  );
}
