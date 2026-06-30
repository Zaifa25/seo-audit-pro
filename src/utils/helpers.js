// helpers.js — small pure utility functions shared across the app

export function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

export function pct(value, total) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

export function makeCheck(id, label, status, message, severity, recommendation) {
  return { id, label, status, message, severity, recommendation };
}

export function countByStatus(checks) {
  return checks.reduce(
    (acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    },
    { pass: 0, warning: 0, error: 0, info: 0 }
  );
}

export function formatBytesEstimate(count) {
  // Rough heuristic only — not a real network measurement.
  return count;
}

export function truncate(str, n) {
  if (!str) return '';
  return str.length > n ? str.slice(0, n) + '…' : str;
}

export function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  return `${hr}h ago`;
}
