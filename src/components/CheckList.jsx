import React from 'react';

const STATUS_ICON = {
  pass: 'bi-check-circle-fill text-success',
  warning: 'bi-exclamation-triangle-fill text-warning',
  error: 'bi-x-circle-fill text-danger',
  info: 'bi-info-circle-fill text-info'
};

const SEVERITY_BADGE = {
  Low: 'bg-secondary-subtle text-secondary-emphasis',
  Medium: 'bg-warning-subtle text-warning-emphasis',
  High: 'bg-danger-subtle text-danger-emphasis'
};

export default function CheckList({ checks }) {
  if (!checks || checks.length === 0) {
    return <div className="text-muted small px-2">No data for this category.</div>;
  }
  return (
    <ul className="list-unstyled mb-0">
      {checks.map((c) => (
        <li key={c.id} className="check-item">
          <div className="d-flex align-items-start gap-2">
            <i className={`bi ${STATUS_ICON[c.status] || ''} mt-1`}></i>
            <div className="flex-grow-1">
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <span className="fw-semibold small">{c.label}</span>
                {c.severity && c.status !== 'pass' && c.status !== 'info' && (
                  <span className={`badge rounded-pill ${SEVERITY_BADGE[c.severity]}`} style={{ fontSize: '0.65rem' }}>
                    {c.severity}
                  </span>
                )}
              </div>
              <div className="text-muted small">{c.message}</div>
              {c.recommendation && (
                <div className="recommendation small mt-1">
                  <i className="bi bi-lightbulb me-1"></i>{c.recommendation}
                </div>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
