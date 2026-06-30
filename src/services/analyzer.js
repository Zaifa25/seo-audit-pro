// analyzer.js — turns the raw DOM snapshot (from content.js) into a structured
// set of SEO checks, grouped by category. Each check has: id, label, status
// (pass | warning | error | info), message, severity, recommendation.

import { STATUS, SEVERITY, TITLE_MIN, TITLE_MAX, DESC_MIN, DESC_MAX } from '../utils/constants.js';
import { makeCheck } from '../utils/helpers.js';

function analyzeMeta(data) {
  const checks = [];
  const { title, meta } = data;
  const titleLen = (title || '').length;

  if (!title) {
    checks.push(makeCheck('title', 'Page Title', STATUS.ERROR, 'Missing <title> tag.', SEVERITY.HIGH, 'Add a unique, descriptive <title> tag between 30–60 characters.'));
  } else if (titleLen < TITLE_MIN) {
    checks.push(makeCheck('title', 'Page Title', STATUS.WARNING, `Title is too short (${titleLen} chars): "${title}"`, SEVERITY.MEDIUM, `Expand the title to ${TITLE_MIN}-${TITLE_MAX} characters, including primary keywords.`));
  } else if (titleLen > TITLE_MAX) {
    checks.push(makeCheck('title', 'Page Title', STATUS.WARNING, `Title is too long (${titleLen} chars) and may be truncated in search results.`, SEVERITY.MEDIUM, `Shorten the title to under ${TITLE_MAX} characters.`));
  } else {
    checks.push(makeCheck('title', 'Page Title', STATUS.PASS, `Title length is optimal (${titleLen} chars): "${title}"`, SEVERITY.LOW, ''));
  }

  const descLen = (meta.description || '').length;
  if (!meta.description) {
    checks.push(makeCheck('description', 'Meta Description', STATUS.ERROR, 'Missing meta description.', SEVERITY.HIGH, `Add a compelling meta description between ${DESC_MIN}-${DESC_MAX} characters.`));
  } else if (descLen < DESC_MIN) {
    checks.push(makeCheck('description', 'Meta Description', STATUS.WARNING, `Description is short (${descLen} chars).`, SEVERITY.MEDIUM, `Expand to ${DESC_MIN}-${DESC_MAX} characters for better SERP visibility.`));
  } else if (descLen > DESC_MAX) {
    checks.push(makeCheck('description', 'Meta Description', STATUS.WARNING, `Description is long (${descLen} chars) and may be truncated.`, SEVERITY.LOW, `Trim to under ${DESC_MAX} characters.`));
  } else {
    checks.push(makeCheck('description', 'Meta Description', STATUS.PASS, `Description length is optimal (${descLen} chars).`, SEVERITY.LOW, ''));
  }

  checks.push(
    meta.charset
      ? makeCheck('charset', 'Charset', STATUS.PASS, `Charset declared: ${meta.charset}`, SEVERITY.LOW, '')
      : makeCheck('charset', 'Charset', STATUS.WARNING, 'No charset declared.', SEVERITY.LOW, 'Add <meta charset="UTF-8"> as the first element in <head>.')
  );

  checks.push(
    meta.viewport
      ? makeCheck('viewport', 'Viewport', STATUS.PASS, `Viewport tag present: ${meta.viewport}`, SEVERITY.LOW, '')
      : makeCheck('viewport', 'Viewport', STATUS.ERROR, 'Missing viewport meta tag.', SEVERITY.HIGH, 'Add <meta name="viewport" content="width=device-width, initial-scale=1">.')
  );

  checks.push(
    meta.language
      ? makeCheck('language', 'Language', STATUS.PASS, `HTML lang attribute set: "${meta.language}"`, SEVERITY.LOW, '')
      : makeCheck('language', 'Language', STATUS.WARNING, 'Missing lang attribute on <html>.', SEVERITY.MEDIUM, 'Add a lang attribute, e.g. <html lang="en">.')
  );

  checks.push(
    meta.author
      ? makeCheck('author', 'Author', STATUS.PASS, `Author meta tag present: ${meta.author}`, SEVERITY.LOW, '')
      : makeCheck('author', 'Author', STATUS.INFO, 'No author meta tag found.', SEVERITY.LOW, 'Optional: add <meta name="author" content="...">.')
  );

  checks.push(
    meta.keywords
      ? makeCheck('keywords', 'Meta Keywords', STATUS.INFO, `Keywords meta present (largely ignored by modern engines): ${meta.keywords}`, SEVERITY.LOW, '')
      : makeCheck('keywords', 'Meta Keywords', STATUS.INFO, 'No meta keywords tag (not a ranking factor today).', SEVERITY.LOW, '')
  );

  return checks;
}

function analyzeHeadings(data) {
  const checks = [];
  const h = data.headings;
  const h1Count = h.h1.length;

  if (h1Count === 0) {
    checks.push(makeCheck('h1-missing', 'H1 Tag', STATUS.ERROR, 'No H1 tag found on the page.', SEVERITY.HIGH, 'Add exactly one H1 tag that describes the main topic of the page.'));
  } else if (h1Count > 1) {
    checks.push(makeCheck('h1-multiple', 'H1 Tag', STATUS.WARNING, `Multiple H1 tags found (${h1Count}).`, SEVERITY.MEDIUM, 'Use a single H1 per page; convert extras to H2/H3.'));
  } else {
    checks.push(makeCheck('h1-single', 'H1 Tag', STATUS.PASS, `Exactly one H1 found: "${h.h1[0].text}"`, SEVERITY.LOW, ''));
  }

  const emptyHeadings = Object.values(h).flat().filter((x) => x.empty).length;
  checks.push(
    emptyHeadings > 0
      ? makeCheck('empty-headings', 'Empty Headings', STATUS.WARNING, `${emptyHeadings} empty heading tag(s) found.`, SEVERITY.MEDIUM, 'Remove or fill empty heading tags.')
      : makeCheck('empty-headings', 'Empty Headings', STATUS.PASS, 'No empty heading tags found.', SEVERITY.LOW, '')
  );

  const counts = [1, 2, 3, 4, 5, 6].map((i) => h[`h${i}`].length);
  let hierarchyOk = true;
  for (let i = 1; i < counts.length; i++) {
    if (counts[i] > 0 && counts.slice(0, i).every((c) => c === 0)) {
      hierarchyOk = false;
      break;
    }
  }
  checks.push(
    hierarchyOk
      ? makeCheck('hierarchy', 'Heading Hierarchy', STATUS.PASS, 'Heading levels appear to be used in a logical order.', SEVERITY.LOW, '')
      : makeCheck('hierarchy', 'Heading Hierarchy', STATUS.WARNING, 'Heading levels skip a level (e.g. H3 used without H2).', SEVERITY.MEDIUM, 'Use heading levels sequentially without skipping.')
  );

  checks.push(makeCheck('heading-counts', 'Heading Distribution', STATUS.INFO, `H1:${counts[0]} H2:${counts[1]} H3:${counts[2]} H4:${counts[3]} H5:${counts[4]} H6:${counts[5]}`, SEVERITY.LOW, ''));

  return checks;
}

function analyzeImages(data) {
  const checks = [];
  const imgs = data.images;
  const total = imgs.length;
  const missingAlt = imgs.filter((i) => !i.hasAlt).length;
  const emptyAlt = imgs.filter((i) => i.altEmpty).length;
  const broken = imgs.filter((i) => i.complete === false).length;
  const lazy = imgs.filter((i) => i.loading === 'lazy').length;
  const noDimensions = imgs.filter((i) => !i.width || !i.height).length;

  checks.push(makeCheck('img-total', 'Total Images', STATUS.INFO, `${total} image(s) found on the page.`, SEVERITY.LOW, ''));

  checks.push(
    missingAlt === 0
      ? makeCheck('img-alt', 'Missing ALT Attributes', STATUS.PASS, 'All images have an alt attribute.', SEVERITY.LOW, '')
      : makeCheck('img-alt', 'Missing ALT Attributes', STATUS.ERROR, `${missingAlt} image(s) missing the alt attribute.`, SEVERITY.HIGH, 'Add descriptive alt text to every image for accessibility and SEO.')
  );

  if (emptyAlt > 0) {
    checks.push(makeCheck('img-alt-empty', 'Empty ALT Attributes', STATUS.WARNING, `${emptyAlt} image(s) have an empty alt="" (acceptable only for purely decorative images).`, SEVERITY.LOW, 'Verify these images are decorative; otherwise add descriptive alt text.'));
  }

  checks.push(
    broken === 0
      ? makeCheck('img-broken', 'Broken Images', STATUS.PASS, 'No broken images detected.', SEVERITY.LOW, '')
      : makeCheck('img-broken', 'Broken Images', STATUS.ERROR, `${broken} image(s) failed to load.`, SEVERITY.HIGH, 'Fix or remove broken image references.')
  );

  checks.push(makeCheck('img-lazy', 'Lazy Loaded Images', STATUS.INFO, `${lazy} of ${total} images use loading="lazy".`, SEVERITY.LOW, total > 5 && lazy === 0 ? 'Consider lazy-loading below-the-fold images to improve page speed.' : ''));

  checks.push(
    noDimensions === 0
      ? makeCheck('img-dimensions', 'Image Dimensions', STATUS.PASS, 'All images have explicit width/height.', SEVERITY.LOW, '')
      : makeCheck('img-dimensions', 'Image Dimensions', STATUS.WARNING, `${noDimensions} image(s) missing explicit width/height.`, SEVERITY.MEDIUM, 'Set width and height attributes to prevent layout shift (CLS).')
  );

  return checks;
}

function analyzeLinks(data) {
  const checks = [];
  const links = data.links;
  const total = links.length;
  const internal = links.filter((l) => l.isInternal).length;
  const external = links.filter((l) => l.isExternal).length;
  const nofollow = links.filter((l) => l.nofollow).length;
  const empty = links.filter((l) => l.isEmpty).length;
  const email = links.filter((l) => l.isEmail).length;
  const tel = links.filter((l) => l.isTel).length;
  const download = links.filter((l) => l.isDownload).length;
  const noText = links.filter((l) => l.text === '' && !l.isEmpty).length;

  checks.push(makeCheck('links-total', 'Total Links', STATUS.INFO, `${total} link(s) found (${internal} internal, ${external} external).`, SEVERITY.LOW, ''));
  checks.push(makeCheck('links-nofollow', 'Nofollow Links', STATUS.INFO, `${nofollow} link(s) use rel="nofollow".`, SEVERITY.LOW, ''));

  checks.push(
    empty === 0
      ? makeCheck('links-empty', 'Empty Links', STATUS.PASS, 'No empty or "#" href links found.', SEVERITY.LOW, '')
      : makeCheck('links-empty', 'Empty Links', STATUS.WARNING, `${empty} link(s) have an empty or "#" href.`, SEVERITY.MEDIUM, 'Give every link a meaningful destination or use a <button> for JS actions.')
  );

  checks.push(
    noText === 0
      ? makeCheck('links-anchor-text', 'Link Anchor Text', STATUS.PASS, 'All links have visible anchor text.', SEVERITY.LOW, '')
      : makeCheck('links-anchor-text', 'Link Anchor Text', STATUS.WARNING, `${noText} link(s) have no visible text (icon-only links).`, SEVERITY.MEDIUM, 'Add aria-label or visually-hidden text to icon-only links.')
  );

  checks.push(makeCheck('links-email', 'Email Links', STATUS.INFO, `${email} mailto: link(s) found.`, SEVERITY.LOW, ''));
  checks.push(makeCheck('links-tel', 'Telephone Links', STATUS.INFO, `${tel} tel: link(s) found.`, SEVERITY.LOW, ''));
  checks.push(makeCheck('links-download', 'Download Links', STATUS.INFO, `${download} download link(s) found.`, SEVERITY.LOW, ''));

  return checks;
}

function analyzeOpenGraph(data) {
  const checks = [];
  const og = data.openGraph;
  const required = ['og:title', 'og:description', 'og:image', 'og:url'];
  const missing = required.filter((k) => !og[k]);

  if (missing.length === 0) {
    checks.push(makeCheck('og-required', 'Required Open Graph Tags', STATUS.PASS, 'All essential Open Graph tags are present.', SEVERITY.LOW, ''));
  } else {
    checks.push(makeCheck('og-required', 'Required Open Graph Tags', STATUS.WARNING, `Missing: ${missing.join(', ')}`, SEVERITY.MEDIUM, 'Add the missing Open Graph tags for better social media previews.'));
  }

  checks.push(
    og['og:type']
      ? makeCheck('og-type', 'og:type', STATUS.PASS, `og:type = "${og['og:type']}"`, SEVERITY.LOW, '')
      : makeCheck('og-type', 'og:type', STATUS.INFO, 'og:type not set (defaults to "website").', SEVERITY.LOW, 'Optionally set og:type to "website", "article", etc.')
  );

  checks.push(
    og['og:site_name']
      ? makeCheck('og-site-name', 'og:site_name', STATUS.PASS, `og:site_name = "${og['og:site_name']}"`, SEVERITY.LOW, '')
      : makeCheck('og-site-name', 'og:site_name', STATUS.INFO, 'og:site_name not set.', SEVERITY.LOW, 'Optionally add og:site_name.')
  );

  return checks;
}

function analyzeTwitterCard(data) {
  const checks = [];
  const tw = data.twitterCard;
  if (!tw['twitter:card']) {
    checks.push(makeCheck('tw-card', 'Twitter Card Type', STATUS.WARNING, 'No twitter:card meta tag found.', SEVERITY.MEDIUM, 'Add <meta name="twitter:card" content="summary_large_image">.'));
  } else {
    checks.push(makeCheck('tw-card', 'Twitter Card Type', STATUS.PASS, `twitter:card = "${tw['twitter:card']}"`, SEVERITY.LOW, ''));
  }
  ['twitter:title', 'twitter:description', 'twitter:image'].forEach((key) => {
    checks.push(
      tw[key]
        ? makeCheck(`tw-${key}`, key, STATUS.PASS, `${key} is present.`, SEVERITY.LOW, '')
        : makeCheck(`tw-${key}`, key, STATUS.INFO, `${key} not set (will fall back to Open Graph tags).`, SEVERITY.LOW, '')
    );
  });
  return checks;
}

function analyzeCanonical(data) {
  const checks = [];
  const canon = data.canonical;
  if (canon.length === 0) {
    checks.push(makeCheck('canonical-missing', 'Canonical Tag', STATUS.WARNING, 'No canonical link tag found.', SEVERITY.MEDIUM, 'Add <link rel="canonical" href="..."> to prevent duplicate content issues.'));
  } else if (canon.length > 1) {
    checks.push(makeCheck('canonical-multiple', 'Canonical Tag', STATUS.ERROR, `Multiple canonical tags found (${canon.length}).`, SEVERITY.HIGH, 'Keep only one canonical tag per page.'));
  } else {
    const url = canon[0];
    let valid = true;
    try {
      new URL(url, data.url);
    } catch (e) {
      valid = false;
    }
    if (!valid) {
      checks.push(makeCheck('canonical-invalid', 'Canonical Tag', STATUS.ERROR, `Canonical URL appears invalid: "${url}"`, SEVERITY.HIGH, 'Use a fully-qualified, valid URL for the canonical tag.'));
    } else {
      const isSelf = new URL(url, data.url).href.replace(/\/$/, '') === data.url.replace(/\/$/, '');
      checks.push(
        isSelf
          ? makeCheck('canonical-self', 'Canonical Tag', STATUS.PASS, `Self-referencing canonical: "${url}"`, SEVERITY.LOW, '')
          : makeCheck('canonical-points-elsewhere', 'Canonical Tag', STATUS.INFO, `Canonical points to a different URL: "${url}"`, SEVERITY.LOW, 'Confirm this is intentional (e.g. for paginated or parameterized pages).')
      );
    }
  }
  return checks;
}

function analyzeRobots(data) {
  const checks = [];
  const robots = (data.meta.robots || '').toLowerCase();
  const noindex = robots.includes('noindex');
  const nofollow = robots.includes('nofollow');

  if (!robots) {
    checks.push(makeCheck('robots-meta', 'Meta Robots', STATUS.PASS, 'No meta robots tag — page is indexable by default.', SEVERITY.LOW, ''));
  } else if (noindex) {
    checks.push(makeCheck('robots-noindex', 'Meta Robots', STATUS.ERROR, `Page is set to NOINDEX (robots="${robots}").`, SEVERITY.HIGH, 'Remove noindex if you want this page to appear in search results.'));
  } else {
    checks.push(makeCheck('robots-meta', 'Meta Robots', STATUS.PASS, `Meta robots: "${robots}"`, SEVERITY.LOW, ''));
  }

  checks.push(
    nofollow
      ? makeCheck('robots-nofollow', 'Follow Status', STATUS.WARNING, 'Page links are set to NOFOLLOW.', SEVERITY.MEDIUM, 'Remove nofollow if you want link equity to pass to linked pages.')
      : makeCheck('robots-follow', 'Follow Status', STATUS.PASS, 'Page links are followable.', SEVERITY.LOW, '')
  );

  return checks;
}

function analyzeStructuredData(data) {
  const checks = [];
  const sd = data.structuredData;
  const valid = sd.jsonLd.filter((i) => !i.error);
  const invalid = sd.jsonLd.filter((i) => i.error);

  if (valid.length === 0 && sd.microdataTypes.length === 0) {
    checks.push(makeCheck('sd-none', 'Structured Data', STATUS.WARNING, 'No JSON-LD or microdata structured data found.', SEVERITY.MEDIUM, 'Add JSON-LD structured data (schema.org) relevant to your content type.'));
  } else {
    const types = [...new Set(valid.map((i) => i.type))];
    checks.push(makeCheck('sd-found', 'Structured Data Detected', STATUS.PASS, `Schema types found: ${types.join(', ') || 'n/a'}${sd.microdataTypes.length ? `, microdata: ${sd.microdataTypes.length}` : ''}`, SEVERITY.LOW, ''));
  }

  if (invalid.length > 0) {
    checks.push(makeCheck('sd-invalid', 'Invalid JSON-LD', STATUS.ERROR, `${invalid.length} JSON-LD block(s) failed to parse.`, SEVERITY.HIGH, 'Validate JSON-LD syntax using Google\'s Rich Results Test.'));
  }

  return checks;
}

function analyzePerformance(data) {
  const checks = [];
  const p = data.performance;

  checks.push(makeCheck('perf-dom', 'DOM Size', p.domElements > 1500 ? STATUS.WARNING : STATUS.PASS, `${p.domElements} DOM elements.`, SEVERITY.MEDIUM, p.domElements > 1500 ? 'Large DOM trees slow down rendering; consider simplifying markup.' : ''));
  checks.push(makeCheck('perf-css', 'CSS Files', p.cssFiles > 8 ? STATUS.WARNING : STATUS.PASS, `${p.cssFiles} external stylesheet(s).`, SEVERITY.LOW, p.cssFiles > 8 ? 'Combine or defer non-critical CSS files.' : ''));
  checks.push(makeCheck('perf-js', 'JavaScript Files', p.jsFiles > 15 ? STATUS.WARNING : STATUS.PASS, `${p.jsFiles} external script(s), ${p.inlineScripts} inline.`, SEVERITY.LOW, p.jsFiles > 15 ? 'Bundle and defer non-critical JavaScript.' : ''));
  checks.push(makeCheck('perf-fonts', 'Web Fonts', STATUS.INFO, `${p.fonts} font resource(s) detected.`, SEVERITY.LOW, ''));
  checks.push(makeCheck('perf-iframes', 'Iframes', p.iframes > 3 ? STATUS.WARNING : STATUS.INFO, `${p.iframes} iframe(s) on the page.`, SEVERITY.LOW, p.iframes > 3 ? 'Lazy-load iframes where possible.' : ''));

  return checks;
}

function analyzeAccessibility(data) {
  const checks = [];
  const a = data.accessibility;
  const imgsMissingAlt = data.images.filter((i) => !i.hasAlt).length;

  checks.push(
    imgsMissingAlt === 0
      ? makeCheck('a11y-alt', 'Image Alt Text', STATUS.PASS, 'All images have alt attributes.', SEVERITY.LOW, '')
      : makeCheck('a11y-alt', 'Image Alt Text', STATUS.ERROR, `${imgsMissingAlt} image(s) missing alt text.`, SEVERITY.HIGH, 'Add alt attributes for screen reader users.')
  );

  checks.push(
    a.missingLabels === 0
      ? makeCheck('a11y-labels', 'Form Labels', STATUS.PASS, 'All form fields have labels or aria-labels.', SEVERITY.LOW, '')
      : makeCheck('a11y-labels', 'Form Labels', STATUS.WARNING, `${a.missingLabels} form field(s) missing labels.`, SEVERITY.MEDIUM, 'Associate every input with a <label> or aria-label.')
  );

  checks.push(
    a.htmlLang
      ? makeCheck('a11y-lang', 'Document Language', STATUS.PASS, `lang="${a.htmlLang}"`, SEVERITY.LOW, '')
      : makeCheck('a11y-lang', 'Document Language', STATUS.WARNING, 'Missing lang attribute.', SEVERITY.MEDIUM, 'Add a lang attribute to <html>.')
  );

  checks.push(
    a.docTitle
      ? makeCheck('a11y-title', 'Document Title', STATUS.PASS, 'Page has a non-empty <title>.', SEVERITY.LOW, '')
      : makeCheck('a11y-title', 'Document Title', STATUS.ERROR, 'Page is missing a <title>.', SEVERITY.HIGH, 'Add a descriptive <title> element.')
  );

  checks.push(
    a.emptyButtons === 0
      ? makeCheck('a11y-buttons', 'Button Labels', STATUS.PASS, 'No empty buttons found.', SEVERITY.LOW, '')
      : makeCheck('a11y-buttons', 'Button Labels', STATUS.WARNING, `${a.emptyButtons} button(s) with no accessible text.`, SEVERITY.MEDIUM, 'Add visible text or aria-label to icon-only buttons.')
  );

  return checks;
}

function analyzeSecurity(data) {
  const checks = [];
  const s = data.security;

  checks.push(
    s.https
      ? makeCheck('sec-https', 'HTTPS', STATUS.PASS, 'Page is served over HTTPS.', SEVERITY.LOW, '')
      : makeCheck('sec-https', 'HTTPS', STATUS.ERROR, 'Page is NOT served over HTTPS.', SEVERITY.HIGH, 'Migrate the site to HTTPS; it is a confirmed ranking factor and required for user trust.')
  );

  if (s.passwordInputsOnHttp) {
    checks.push(makeCheck('sec-password-http', 'Password Field Over HTTP', STATUS.ERROR, 'A password field was found on a non-HTTPS page.', SEVERITY.HIGH, 'Never collect credentials over an insecure connection.'));
  }

  checks.push(
    s.mixedContentImages === 0
      ? makeCheck('sec-mixed', 'Mixed Content', STATUS.PASS, 'No mixed-content (http://) images detected.', SEVERITY.LOW, '')
      : makeCheck('sec-mixed', 'Mixed Content', STATUS.WARNING, `${s.mixedContentImages} image(s) loaded over plain HTTP on an HTTPS page.`, SEVERITY.MEDIUM, 'Serve all resources over HTTPS to avoid mixed-content warnings.')
  );

  checks.push(makeCheck('sec-inline-scripts', 'Inline Scripts', s.inlineScriptCount > 10 ? STATUS.WARNING : STATUS.INFO, `${s.inlineScriptCount} inline <script> block(s) found.`, SEVERITY.LOW, s.inlineScriptCount > 10 ? 'Consider a Content-Security-Policy and moving inline scripts to external files.' : ''));
  checks.push(makeCheck('sec-iframes', 'Iframes', s.iframeCount > 0 ? STATUS.INFO : STATUS.PASS, `${s.iframeCount} iframe(s) found.`, SEVERITY.LOW, s.iframeCount > 0 ? 'Ensure iframes use the sandbox attribute where possible.' : ''));

  return checks;
}

function analyzeMobile(data) {
  const checks = [];
  const m = data.mobile;

  checks.push(
    m.hasViewport
      ? makeCheck('mobile-viewport', 'Viewport Meta Tag', STATUS.PASS, `Viewport present: "${m.viewport}"`, SEVERITY.LOW, '')
      : makeCheck('mobile-viewport', 'Viewport Meta Tag', STATUS.ERROR, 'No viewport meta tag — page will not be mobile responsive.', SEVERITY.HIGH, 'Add <meta name="viewport" content="width=device-width, initial-scale=1">.')
  );

  checks.push(
    m.appleTouchIcon
      ? makeCheck('mobile-touch-icon', 'Apple Touch Icon', STATUS.PASS, 'Apple touch icon present.', SEVERITY.LOW, '')
      : makeCheck('mobile-touch-icon', 'Apple Touch Icon', STATUS.INFO, 'No apple-touch-icon found.', SEVERITY.LOW, 'Optionally add <link rel="apple-touch-icon" href="...">.')
  );

  checks.push(
    m.manifest
      ? makeCheck('mobile-manifest', 'Web App Manifest', STATUS.PASS, 'PWA manifest detected.', SEVERITY.LOW, '')
      : makeCheck('mobile-manifest', 'Web App Manifest', STATUS.INFO, 'No web app manifest found.', SEVERITY.LOW, 'Optional: add a manifest.json for PWA support.')
  );

  return checks;
}

function analyzeUrl(data) {
  const checks = [];
  const url = new URL(data.url);
  const len = data.url.length;

  checks.push(makeCheck('url-https', 'URL Protocol', url.protocol === 'https:' ? STATUS.PASS : STATUS.ERROR, `Protocol: ${url.protocol}`, SEVERITY.HIGH, url.protocol !== 'https:' ? 'Use HTTPS.' : ''));
  checks.push(makeCheck('url-length', 'URL Length', len > 100 ? STATUS.WARNING : STATUS.PASS, `${len} characters.`, SEVERITY.LOW, len > 100 ? 'Shorter URLs are easier to read and share.' : ''));
  checks.push(makeCheck('url-params', 'Query Parameters', url.search ? STATUS.INFO : STATUS.PASS, url.search ? `Query string: ${url.search}` : 'No query parameters.', SEVERITY.LOW, ''));
  checks.push(makeCheck('url-uppercase', 'Uppercase Letters', /[A-Z]/.test(url.pathname) ? STATUS.WARNING : STATUS.PASS, /[A-Z]/.test(url.pathname) ? 'URL path contains uppercase letters.' : 'URL path is lowercase.', SEVERITY.LOW, /[A-Z]/.test(url.pathname) ? 'Use lowercase URLs to avoid duplicate-content issues.' : ''));
  checks.push(makeCheck('url-underscores', 'Underscores', url.pathname.includes('_') ? STATUS.WARNING : STATUS.PASS, url.pathname.includes('_') ? 'URL path contains underscores.' : 'No underscores in URL path.', SEVERITY.LOW, url.pathname.includes('_') ? 'Use hyphens instead of underscores in URLs.' : ''));

  return checks;
}

function analyzeDuplicateContent(data) {
  const checks = [];
  const h1Texts = data.headings.h1.map((h) => h.text.toLowerCase()).filter(Boolean);
  const dupH1 = h1Texts.length !== new Set(h1Texts).size;
  checks.push(
    dupH1
      ? makeCheck('dup-h1', 'Duplicate Headings', STATUS.WARNING, 'Duplicate H1 text detected.', SEVERITY.MEDIUM, 'Ensure each heading is unique and descriptive.')
      : makeCheck('dup-h1', 'Duplicate Headings', STATUS.PASS, 'No duplicate H1 text found.', SEVERITY.LOW, '')
  );
  return checks;
}

// Runs the full audit and returns a category -> checks[] map.
export function runFullAudit(rawData) {
  return {
    meta: analyzeMeta(rawData),
    headings: analyzeHeadings(rawData),
    images: analyzeImages(rawData),
    links: analyzeLinks(rawData),
    openGraph: analyzeOpenGraph(rawData),
    twitterCard: analyzeTwitterCard(rawData),
    canonical: analyzeCanonical(rawData),
    robots: analyzeRobots(rawData),
    structuredData: analyzeStructuredData(rawData),
    performance: analyzePerformance(rawData),
    accessibility: analyzeAccessibility(rawData),
    security: analyzeSecurity(rawData),
    mobile: analyzeMobile(rawData),
    url: analyzeUrl(rawData),
    duplicateContent: analyzeDuplicateContent(rawData)
  };
}
