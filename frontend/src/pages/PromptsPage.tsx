import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { listPrompts, createPrompt, deletePrompt, PromptListItem } from '../api/client';
import { CreatePromptModal } from '../components/CreatePromptModal';

type SortField = 'name' | 'date' | 'versions';

export function PromptsPage() {
  const navigate = useNavigate();
  const [prompts, setPrompts] = useState<PromptListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortAsc, setSortAsc] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listPrompts();
      setPrompts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch prompts');
      console.error('Failed to fetch prompts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePrompt = async (name: string, content: string) => {
    setIsCreating(true);
    try {
      await createPrompt(name, content);
      await fetchPrompts();
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeletePrompt = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this prompt?')) {
      return;
    }

    setDeletingId(id);
    try {
      await deletePrompt(id);
      setPrompts(prompts.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Failed to delete prompt:', err);
      alert('Failed to delete prompt');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredAndSortedPrompts = useMemo(() => {
    let filtered = prompts.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = a.lastModified - b.lastModified;
          break;
        case 'versions':
          comparison = a.versionCount - b.versionCount;
          break;
      }
      return sortAsc ? comparison : -comparison;
    });

    return filtered;
  }, [prompts, searchQuery, sortField, sortAsc]);

  const handleSortChange = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
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

  const getSortIndicator = (field: SortField) => {
    if (sortField !== field) return '';
    return sortAsc ? ' ↑' : ' ↓';
  };

  return (
    <div className="prompts-page">
      <div style={{ marginBottom: '2rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <h1 style={{ margin: 0 }}>Prompts</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary"
          >
            + Create New Prompt
          </button>
        </div>

        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
        }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search prompts by name..."
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '0.75rem',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              fontSize: '0.875rem',
            }}
          />
        </div>
      </div>

      <CreatePromptModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreatePrompt={handleCreatePrompt}
        isLoading={isCreating}
      />

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {loading ? (
        <div className="loading">
          <p>Loading prompts...</p>
        </div>
      ) : filteredAndSortedPrompts.length === 0 ? (
        <div style={{
          background: 'white',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          padding: '2rem',
          textAlign: 'center',
          color: '#6c757d',
        }}>
          {searchQuery ? (
            <>
              <p>No prompts found matching "{searchQuery}"</p>
              <button
                onClick={() => setSearchQuery('')}
                className="btn btn-secondary"
                style={{ marginTop: '1rem' }}
              >
                Clear search
              </button>
            </>
          ) : (
            <>
              <p>No prompts yet. Create your first prompt to get started!</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn btn-primary"
                style={{ marginTop: '1rem' }}
              >
                Create First Prompt
              </button>
            </>
          )}
        </div>
      ) : (
        <div style={{
          background: 'white',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          overflowX: 'auto',
        }}>
          <table className="prompts-table">
            <thead>
              <tr>
                <th>
                  <button
                    onClick={() => handleSortChange('name')}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 'inherit',
                      fontWeight: 'inherit',
                      color: 'inherit',
                      padding: 0,
                    }}
                  >
                    Name{getSortIndicator('name')}
                  </button>
                </th>
                <th>
                  <button
                    onClick={() => handleSortChange('versions')}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 'inherit',
                      fontWeight: 'inherit',
                      color: 'inherit',
                      padding: 0,
                    }}
                  >
                    Versions{getSortIndicator('versions')}
                  </button>
                </th>
                <th>
                  <button
                    onClick={() => handleSortChange('date')}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 'inherit',
                      fontWeight: 'inherit',
                      color: 'inherit',
                      padding: 0,
                    }}
                  >
                    Last Modified{getSortIndicator('date')}
                  </button>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedPrompts.map((prompt) => (
                <tr
                  key={prompt.id}
                  onClick={() => navigate(`/prompts/${prompt.id}`)}
                  style={{
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f8f9fa';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <td style={{ fontWeight: 500 }}>{prompt.name}</td>
                  <td>
                    <span className="badge badge-default">
                      v{prompt.versionCount}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                    {formatDate(prompt.lastModified)}
                  </td>
                  <td>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/prompts/${prompt.id}`);
                      }}
                      className="btn btn-secondary"
                      style={{
                        padding: '0.25rem 0.75rem',
                        fontSize: '0.75rem',
                        marginRight: '0.5rem',
                      }}
                    >
                      View
                    </button>
                    <button
                      onClick={(e) => handleDeletePrompt(prompt.id, e)}
                      disabled={deletingId === prompt.id}
                      className="btn"
                      style={{
                        padding: '0.25rem 0.75rem',
                        fontSize: '0.75rem',
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        opacity: deletingId === prompt.id ? 0.5 : 1,
                      }}
                    >
                      {deletingId === prompt.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
