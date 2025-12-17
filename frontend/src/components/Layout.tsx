import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <header style={{
        background: '#2c3e50',
        color: 'white',
        padding: '1rem 2rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>
          Itera
        </h1>
        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', opacity: 0.9 }}>
          Version control for AI prompts
        </p>
      </header>

      <main style={{
        flex: 1,
        padding: '2rem',
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
      }}>
        {children}
      </main>

      <footer style={{
        background: '#f8f9fa',
        padding: '1rem 2rem',
        textAlign: 'center',
        fontSize: '0.875rem',
        color: '#6c757d',
        borderTop: '1px solid #dee2e6',
      }}>
        <p style={{ margin: 0 }}>
          Itera v0.1.0 - Phase 0: Foundation
        </p>
      </footer>
    </div>
  );
}
