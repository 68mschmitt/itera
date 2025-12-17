import { ReactNode } from 'react';
import { Navigation } from './Navigation';

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
      <Navigation />

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
          Itera v0.1.0 - Phase 1B: Prompt UI & Navigation
        </p>
      </footer>
    </div>
  );
}
