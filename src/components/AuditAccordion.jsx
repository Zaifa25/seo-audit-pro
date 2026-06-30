import React, { useState } from 'react';
import CheckList from './CheckList.jsx';
import { computeCategoryScore } from '../services/seoScore.js';

export default function AuditAccordion({ id, icon, title, checks, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const score = computeCategoryScore(checks);
  const errorCount = checks.filter((c) => c.status === 'error').length;
  const warnCount = checks.filter((c) => c.status === 'warning').length;

  return (
    <div className="audit-accordion mb-2">
      <button
        className="accordion-toggle w-100 d-flex align-items-center justify-content-between"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="d-flex align-items-center gap-2">
          <i className={`bi ${icon}`}></i>
          <span className="fw-semibold small">{title}</span>
        </span>
        <span className="d-flex align-items-center gap-2">
          {errorCount > 0 && <span className="badge bg-danger">{errorCount}</span>}
          {warnCount > 0 && <span className="badge bg-warning text-dark">{warnCount}</span>}
          <span className="badge bg-light text-dark border">{score}%</span>
          <i className={`bi bi-chevron-${open ? 'up' : 'down'} small`}></i>
        </span>
      </button>
      {open && (
        <div className="accordion-body-custom">
          <CheckList checks={checks} />
        </div>
      )}
    </div>
  );
}
