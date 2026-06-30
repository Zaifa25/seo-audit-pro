// constants.js — shared constants used across the audit engine and UI

export const STATUS = {
  PASS: 'pass',
  WARNING: 'warning',
  ERROR: 'error',
  INFO: 'info'
};

export const SEVERITY = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High'
};

// Category weights must sum to 100. Used by seoScore.js to compute the
// overall weighted SEO score.
export const CATEGORY_WEIGHTS = {
  meta: 14,
  headings: 10,
  images: 8,
  links: 8,
  openGraph: 6,
  twitterCard: 4,
  canonical: 6,
  robots: 6,
  structuredData: 8,
  performance: 8,
  accessibility: 8,
  security: 8,
  mobile: 6
};

export const CATEGORY_LABELS = {
  meta: 'Meta Information',
  headings: 'Heading Structure',
  images: 'Images',
  links: 'Links',
  openGraph: 'Open Graph',
  twitterCard: 'Twitter Cards',
  canonical: 'Canonical URL',
  robots: 'Robots & Indexability',
  structuredData: 'Structured Data',
  performance: 'Performance',
  accessibility: 'Accessibility',
  security: 'Security',
  mobile: 'Mobile SEO'
};

export const TITLE_MIN = 30;
export const TITLE_MAX = 60;
export const DESC_MIN = 70;
export const DESC_MAX = 160;
