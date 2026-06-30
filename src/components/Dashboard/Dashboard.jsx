import React from 'react';
import SeoScoreCard from '../SeoScoreCard/SeoScoreCard.jsx';
import { truncate } from '../../utils/helpers.js';

export default function Dashboard({ rawData, score }) {
  return (
    <div>
      <div className="card mb-3">
        <div className="card-body d-flex align-items-center gap-2">
          <img
            src={rawData.favicon}
            alt=""
            width="28"
            height="28"
            className="rounded"
            onError={(e) => { e.target.style.visibility = 'hidden'; }}
          />
          <div className="flex-grow-1 overflow-hidden">
            <div className="fw-semibold text-truncate" title={rawData.title}>{rawData.title || 'Untitled page'}</div>
            <div className="text-muted small text-truncate" title={rawData.url}>{truncate(rawData.url, 60)}</div>
          </div>
          <span className={`badge ${rawData.protocol === 'https:' ? 'bg-success' : 'bg-danger'}`}>
            {rawData.protocol === 'https:' ? 'HTTPS' : 'NOT SECURE'}
          </span>
        </div>
      </div>

      <SeoScoreCard score={score.overall} counts={score.counts} />

      <div className="row g-2 mb-3">
        <div className="col-6">
          <div className="stat-box">
            <div className="text-muted small">Total Checks</div>
            <div className="fs-5 fw-bold">{score.totalChecks}</div>
          </div>
        </div>
        <div className="col-6">
          <div className="stat-box">
            <div className="text-muted small">Last Scan</div>
            <div className="fs-6 fw-semibold">{new Date(rawData.timestamp).toLocaleTimeString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
