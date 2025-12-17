import { useEffect, useState } from 'react';
import { getHealth, HealthResponse } from '../api/client';

export function Home() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        background: '#e7f3ff',
        border: '1px solid #b3d9ff',
        borderRadius: '8px',
        padding: '1.5rem',
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '0.5rem' }}>Next Steps</h3>
        <ul style={{ marginBottom: 0, paddingLeft: '1.5rem' }}>
          <li>Phase 0 (Foundation) is complete!</li>
          <li>Backend and frontend are communicating</li>
          <li>SQLite database is initialized</li>
          <li>Ollama integration is {health?.ollama.status === 'connected' ? 'working' : 'pending'}</li>
          <li>Ready to implement Phase 1: Prompt Versioning</li>
        </ul>
      </div>
    </div>
  );
}
