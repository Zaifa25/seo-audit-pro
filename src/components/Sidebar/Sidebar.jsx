import React from 'react';

export const TABS = [
  { key: 'overview', label: 'Overview', icon: 'bi-speedometer2' },
  { key: 'audit', label: 'Audit Details', icon: 'bi-list-check' },
  { key: 'recommendations', label: 'Recommendations', icon: 'bi-clipboard-check' },
  { key: 'history', label: 'History', icon: 'bi-clock-history' },
  { key: 'export', label: 'Export', icon: 'bi-download' }
];

export default function Sidebar({ active, onChange, search, onSearch }) {
  return (
    <div className="sidebar-tabs mb-3">
      <div className="input-group input-group-sm mb-2">
        <span className="input-group-text bg-transparent"><i className="bi bi-search"></i></span>
        <input
          type="text"
          className="form-control"
          placeholder="Search audit sections..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      <div className="d-flex flex-wrap gap-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`btn btn-sm tab-btn ${active === t.key ? 'active' : ''}`}
            onClick={() => onChange(t.key)}
          >
            <i className={`bi ${t.icon} me-1`}></i>{t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
