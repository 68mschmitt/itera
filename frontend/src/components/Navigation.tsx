import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

export function Navigation() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/" className="navbar-logo" onClick={closeMenu}>
            <span className="logo-icon">⚡</span>
            Itera
          </Link>
          <p className="navbar-tagline">Version control for AI prompts</p>
        </div>

        <button
          className="navbar-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <Link
            to="/"
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
            onClick={closeMenu}
          >
            Home
          </Link>
          <Link
            to="/prompts"
            className={`nav-link ${isActive('/prompts') ? 'active' : ''}`}
            onClick={closeMenu}
          >
            Prompts
          </Link>
          <Link
            to="/runs"
            className={`nav-link ${isActive('/runs') ? 'active' : ''}`}
            onClick={closeMenu}
          >
            Runs
          </Link>
        </div>
      </div>
    </nav>
  );
}
