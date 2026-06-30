import React, { useState } from 'react';
import { buildReport, exportPDF, exportJSON, exportCSV, exportTXT, exportMarkdown } from '../../services/exporter.js';

const FORMATS = [
  { key: 'pdf', label: 'PDF', icon: 'bi-file-earmark-pdf', fn: exportPDF },
  { key: 'json', label: 'JSON', icon: 'bi-filetype-json', fn: exportJSON },
  { key: 'csv', label: 'CSV', icon: 'bi-filetype-csv', fn: exportCSV },
  { key: 'txt', label: 'TXT', icon: 'bi-file-earmark-text', fn: exportTXT },
  { key: 'md', label: 'Markdown', icon: 'bi-markdown', fn: exportMarkdown }
];

export default function ExportSection({ rawData, audit, score }) {
  const [copied, setCopied] = useState(false);

  const handleExport = (fn) => {
    const report = buildReport({ rawData, audit, score });
    fn(report);
  };

  const handleCopy = async () => {
    const report = buildReport({ rawData, audit, score });
    await navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="card mb-3">
      <div className="card-body">
        <div className="fw-bold mb-2"><i className="bi bi-download me-1"></i>Export Report</div>
        <div className="d-flex flex-wrap gap-2">
          {FORMATS.map((f) => (
            <button
              key={f.key}
              className="btn btn-sm btn-outline-primary"
              onClick={() => handleExport(f.fn)}
            >
              <i className={`bi ${f.icon} me-1`}></i>{f.label}
            </button>
          ))}
          <button className="btn btn-sm btn-outline-secondary" onClick={handleCopy}>
            <i className="bi bi-clipboard me-1"></i>{copied ? 'Copied!' : 'Copy JSON'}
          </button>
          <button className="btn btn-sm btn-outline-secondary" onClick={() => window.print()}>
            <i className="bi bi-printer me-1"></i>Print
          </button>
        </div>
      </div>
    </div>
  );
}
