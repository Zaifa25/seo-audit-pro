import React, { useMemo, useState } from 'react';
import { CATEGORY_LABELS } from '../../utils/constants.js';

const SEVERITY_ORDER = { High: 0, Medium: 1, Low: 2 };

export default function Recommendations({ audit }) {
  const [filter, setFilter] = useState('all');

  const issues = useMemo(() => {
    const list = [];
    Object.entries(audit).forEach(([category, checks]) => {
      checks.forEach((c) => {
        if ((c.status === 'error' || c.status === 'warning') && c.recommendation) {
          list.push({ ...c, category: CATEGORY_LABELS[category] || category });
        }
      });
    });
    return list.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
  }, [audit]);

  const filtered = issues.filter((i) => filter === 'all' || i.status === filter);

  if (issues.length === 0) {
    return (
      <div className="card mb-3">
        <div className="card-body text-center text-success py-4">
          <i className="bi bi-check-circle fs-2"></i>
          <div className="mt-2 fw-semibold">No critical issues found. Great job!</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card mb-3">
      <div className="card-body">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <div className="fw-bold"><i className="bi bi-clipboard-check me-1"></i>Recommendations ({issues.length})</div>
          <div className="btn-group btn-group-sm">
            {['all', 'error', 'warning'].map((f) => (
              <button
                key={f}
                className={`btn btn-outline-secondary ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'All' : f === 'error' ? 'Errors' : 'Warnings'}
              </button>
            ))}
          </div>
        </div>
        <ul className="list-unstyled mb-0">
          {filtered.map((c, idx) => (
            <li key={idx} className="recommendation-item">
              <div className="d-flex align-items-start gap-2">
                <span className={`badge ${c.status === 'error' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                  {c.severity}
                </span>
                <div>
                  <div className="small fw-semibold">{c.category} — {c.label}</div>
                  <div className="small text-muted">{c.message}</div>
                  <div className="small recommendation mt-1"><i className="bi bi-lightbulb me-1"></i>{c.recommendation}</div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
