import React from 'react';
import { useStorage } from '../hooks/useStorage.js';
import { timeAgo, truncate } from '../utils/helpers.js';

export default function HistoryPanel() {
  const [history, setHistory] = useStorage('seoAuditHistory', []);

  const clearHistory = () => setHistory([]);

  if (!history || history.length === 0) {
    return (
      <div className="empty-state text-muted">
        <i className="bi bi-clock-history fs-2"></i>
        <div className="mt-2">No previous scans yet. Run an audit to see history here.</div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div className="fw-bold">Recent Scans</div>
        <button className="btn btn-sm btn-outline-danger" onClick={clearHistory}>
          <i className="bi bi-trash me-1"></i>Clear
        </button>
      </div>
      {history.map((h, i) => (
        <div key={i} className="history-item">
          <img src={h.favicon} alt="" width="20" height="20" className="rounded" onError={(e) => (e.target.style.visibility = 'hidden')} />
          <div className="flex-grow-1 overflow-hidden">
            <div className="small fw-semibold text-truncate">{h.title || h.url}</div>
            <div className="small text-muted text-truncate">{truncate(h.url, 40)} • {timeAgo(h.date)}</div>
          </div>
          <span className={`badge ${h.score >= 90 ? 'bg-success' : h.score >= 50 ? 'bg-warning text-dark' : 'bg-danger'}`}>
            {h.score}
          </span>
        </div>
      ))}
    </div>
  );
}
