import React, { useState } from 'react';

export default function KeywordSection({ rawData }) {
  const [open, setOpen] = useState(false);
  const ws = rawData.wordStats;
  const maxCount = ws.topKeywords[0]?.count || 1;

  return (
    <div className="audit-accordion mb-2">
      <button
        className="accordion-toggle w-100 d-flex align-items-center justify-content-between"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="d-flex align-items-center gap-2">
          <i className="bi bi-tags"></i>
          <span className="fw-semibold small">Keyword Analysis</span>
        </span>
        <span className="d-flex align-items-center gap-2">
          <span className="badge bg-light text-dark border">{ws.wordCount} words</span>
          <i className={`bi bi-chevron-${open ? 'up' : 'down'} small`}></i>
        </span>
      </button>
      {open && (
        <div className="accordion-body-custom">
          <div className="row text-center g-2 mb-3">
            <div className="col-4">
              <div className="stat-box">
                <div className="fs-6 fw-bold">{ws.wordCount}</div>
                <div className="text-muted" style={{ fontSize: '0.65rem' }}>Words</div>
              </div>
            </div>
            <div className="col-4">
              <div className="stat-box">
                <div className="fs-6 fw-bold">{ws.charCount}</div>
                <div className="text-muted" style={{ fontSize: '0.65rem' }}>Characters</div>
              </div>
            </div>
            <div className="col-4">
              <div className="stat-box">
                <div className="fs-6 fw-bold">{ws.readingTime}m</div>
                <div className="text-muted" style={{ fontSize: '0.65rem' }}>Reading Time</div>
              </div>
            </div>
          </div>

          <div className="small fw-semibold mb-1">Top Keywords</div>
          {ws.topKeywords.length === 0 && <div className="text-muted small">Not enough text content to analyze.</div>}
          {ws.topKeywords.map((k) => (
            <div key={k.word} className="d-flex align-items-center gap-2 mb-1">
              <span className="small text-truncate" style={{ width: '90px' }}>{k.word}</span>
              <div className="keyword-bar flex-grow-1">
                <div className="keyword-bar-fill" style={{ width: `${(k.count / maxCount) * 100}%` }} />
              </div>
              <span className="small text-muted">{k.count}</span>
            </div>
          ))}

          {ws.longestWords.length > 0 && (
            <div className="mt-2">
              <div className="small fw-semibold mb-1">Longest Words</div>
              <div className="d-flex flex-wrap gap-1">
                {ws.longestWords.map((w, i) => (
                  <span key={i} className="badge bg-secondary-subtle text-secondary-emphasis">{w}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
