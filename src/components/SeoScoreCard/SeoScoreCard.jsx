import React from 'react';
import { scoreLabel } from '../../services/seoScore.js';

export default function SeoScoreCard({ score, counts }) {
  const { label, color } = scoreLabel(score);
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="card score-card mb-3">
      <div className="card-body d-flex align-items-center gap-3">
        <div className="score-ring">
          <svg width="100" height="100" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="var(--ring-bg)" strokeWidth="8" />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
              style={{ transition: 'stroke-dashoffset 0.8s ease' }}
            />
          </svg>
          <div className="score-ring-text">
            <div className="fw-bold fs-4">{score}</div>
            <div className="text-muted" style={{ fontSize: '0.65rem' }}>/ 100</div>
          </div>
        </div>
        <div className="flex-grow-1">
          <div className="fw-semibold mb-1" style={{ color }}>{label}</div>
          <div className="d-flex gap-3 small">
            <span className="text-success"><i className="bi bi-check-circle-fill me-1"></i>{counts.pass} Passed</span>
            <span className="text-warning"><i className="bi bi-exclamation-triangle-fill me-1"></i>{counts.warning} Warnings</span>
            <span className="text-danger"><i className="bi bi-x-circle-fill me-1"></i>{counts.error} Errors</span>
          </div>
        </div>
      </div>
    </div>
  );
}
