// exporter.js — builds downloadable reports from audit results in
// multiple formats: PDF, JSON, CSV, TXT, Markdown.

import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import { CATEGORY_LABELS } from '../utils/constants.js';

function flattenChecks(auditResults) {
  const rows = [];
  Object.entries(auditResults).forEach(([category, checks]) => {
    checks.forEach((c) => {
      rows.push({ category: CATEGORY_LABELS[category] || category, ...c });
    });
  });
  return rows;
}

export function exportJSON(report) {
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  saveAs(blob, `seo-audit-${safeName(report.meta.url)}.json`);
}

export function exportCSV(report) {
  const rows = flattenChecks(report.audit).map((r) => ({
    Category: r.category,
    Check: r.label,
    Status: r.status,
    Severity: r.severity,
    Message: r.message,
    Recommendation: r.recommendation
  }));
  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: 'text/csv' });
  saveAs(blob, `seo-audit-${safeName(report.meta.url)}.csv`);
}

export function exportTXT(report) {
  let out = `SEO AUDIT REPORT\n`;
  out += `URL: ${report.meta.url}\n`;
  out += `Date: ${report.meta.date}\n`;
  out += `Overall Score: ${report.score.overall}/100\n\n`;
  Object.entries(report.audit).forEach(([category, checks]) => {
    out += `\n== ${CATEGORY_LABELS[category] || category} ==\n`;
    checks.forEach((c) => {
      out += `[${c.status.toUpperCase()}] ${c.label}: ${c.message}\n`;
      if (c.recommendation) out += `  -> Recommendation: ${c.recommendation}\n`;
    });
  });
  const blob = new Blob([out], { type: 'text/plain' });
  saveAs(blob, `seo-audit-${safeName(report.meta.url)}.txt`);
}

export function exportMarkdown(report) {
  let out = `# SEO Audit Report\n\n`;
  out += `**URL:** ${report.meta.url}\n\n`;
  out += `**Date:** ${report.meta.date}\n\n`;
  out += `**Overall Score:** ${report.score.overall}/100\n\n`;
  Object.entries(report.audit).forEach(([category, checks]) => {
    out += `\n## ${CATEGORY_LABELS[category] || category}\n\n`;
    out += `| Status | Check | Message | Recommendation |\n|---|---|---|---|\n`;
    checks.forEach((c) => {
      out += `| ${c.status} | ${c.label} | ${c.message.replace(/\|/g, '/')} | ${(c.recommendation || '').replace(/\|/g, '/')} |\n`;
    });
  });
  const blob = new Blob([out], { type: 'text/markdown' });
  saveAs(blob, `seo-audit-${safeName(report.meta.url)}.md`);
}

export function exportPDF(report) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const marginX = 40;
  let y = 50;
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFontSize(18);
  doc.text('SEO Audit Report', marginX, y);
  y += 22;
  doc.setFontSize(10);
  doc.text(`URL: ${report.meta.url}`, marginX, y);
  y += 14;
  doc.text(`Date: ${report.meta.date}`, marginX, y);
  y += 14;
  doc.text(`Overall Score: ${report.score.overall}/100`, marginX, y);
  y += 24;

  Object.entries(report.audit).forEach(([category, checks]) => {
    if (y > pageHeight - 80) {
      doc.addPage();
      y = 50;
    }
    doc.setFontSize(13);
    doc.setFont(undefined, 'bold');
    doc.text(CATEGORY_LABELS[category] || category, marginX, y);
    y += 16;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);

    checks.forEach((c) => {
      if (y > pageHeight - 60) {
        doc.addPage();
        y = 50;
      }
      const line = `[${c.status.toUpperCase()}] ${c.label}: ${c.message}`;
      const wrapped = doc.splitTextToSize(line, 515);
      doc.text(wrapped, marginX, y);
      y += wrapped.length * 11 + 4;
      if (c.recommendation) {
        const rec = doc.splitTextToSize(`Recommendation: ${c.recommendation}`, 500);
        doc.setTextColor(90);
        doc.text(rec, marginX + 12, y);
        doc.setTextColor(0);
        y += rec.length * 11 + 6;
      }
    });
    y += 8;
  });

  doc.save(`seo-audit-${safeName(report.meta.url)}.pdf`);
}

function safeName(url) {
  try {
    return new URL(url).hostname.replace(/\./g, '-');
  } catch (e) {
    return 'report';
  }
}

export function buildReport({ rawData, audit, score }) {
  return {
    meta: { url: rawData.url, title: rawData.title, date: new Date().toLocaleString() },
    audit,
    score
  };
}
