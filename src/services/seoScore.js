// seoScore.js — computes a weighted overall SEO score (0-100) plus a
// per-category score breakdown, from the checks produced by analyzer.js

import { CATEGORY_WEIGHTS } from '../utils/constants.js';
import { countByStatus } from '../utils/helpers.js';

// A single check contributes 1 point if pass, 0.5 if info, 0.25 if warning, 0 if error.
function checkScore(check) {
  switch (check.status) {
    case 'pass':
      return 1;
    case 'info':
      return 0.85;
    case 'warning':
      return 0.4;
    case 'error':
    default:
      return 0;
  }
}

export function computeCategoryScore(checks) {
  if (!checks || checks.length === 0) return 100;
  const total = checks.reduce((sum, c) => sum + checkScore(c), 0);
  return Math.round((total / checks.length) * 100);
}

export function computeOverallScore(auditResults) {
  let weightedSum = 0;
  let weightTotal = 0;
  const breakdown = {};

  Object.entries(CATEGORY_WEIGHTS).forEach(([category, weight]) => {
    const checks = auditResults[category] || [];
    const score = computeCategoryScore(checks);
    breakdown[category] = score;
    weightedSum += score * weight;
    weightTotal += weight;
  });

  const overall = weightTotal > 0 ? Math.round(weightedSum / weightTotal) : 0;

  // Aggregate pass/warning/error counts across ALL categories (including
  // the unweighted ones like url/duplicateContent) for the dashboard summary.
  const allChecks = Object.values(auditResults).flat();
  const counts = countByStatus(allChecks);

  return { overall, breakdown, counts, totalChecks: allChecks.length };
}

export function scoreLabel(score) {
  if (score >= 90) return { label: 'Excellent', color: '#22c55e' };
  if (score >= 75) return { label: 'Good', color: '#84cc16' };
  if (score >= 50) return { label: 'Needs Work', color: '#f59e0b' };
  return { label: 'Poor', color: '#ef4444' };
}
