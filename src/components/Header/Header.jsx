import React from 'react';

export default function Header({ darkMode, onToggleTheme, onRescan, loading }) {
  return (
    <header className="d-flex align-items-center justify-content-between px-3 py-2 app-header">
      <div className="d-flex align-items-center gap-2">
        <i className="bi bi-graph-up-arrow fs-4 text-primary"></i>
        <div>
          <div className="fw-bold fs-6 lh-1">SEO Audit Pro</div>
          <div className="text-muted" style={{ fontSize: '0.7rem' }}>On-page SEO analysis</div>
        </div>
      </div>
      <div className="d-flex align-items-center gap-2">
        <button
          className="btn btn-sm btn-outline-secondary"
          title="Re-scan this page"
          onClick={onRescan}
          disabled={loading}
        >
          <i className={`bi bi-arrow-clockwise ${loading ? 'spin' : ''}`}></i>
        </button>
        <button
          className="btn btn-sm btn-outline-secondary"
          title="Toggle dark mode"
          onClick={onToggleTheme}
        >
          <i className={`bi ${darkMode ? 'bi-sun' : 'bi-moon-stars'}`}></i>
        </button>
      </div>
    </header>
  );
}
