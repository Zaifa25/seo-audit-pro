// content.js
// This script is injected programmatically (via chrome.scripting.executeScript)
// into the active tab. It reads the live DOM and returns a plain JSON-serializable
// object describing everything the popup needs to compute an SEO audit.
// It does NOT make network requests except a couple of lightweight HEAD/GET
// checks for robots.txt / sitemap.xml, gated behind try/catch so a failure
// never breaks the rest of the audit.

(function () {
  function text(el) {
    return el ? el.textContent.trim() : '';
  }

  function attr(el, name) {
    return el ? el.getAttribute(name) : null;
  }

  function getMeta(name, attrName = 'name') {
    const el = document.querySelector(`meta[${attrName}="${name}"]`);
    return el ? el.getAttribute('content') : null;
  }

  function collectHeadings() {
    const result = {};
    for (let i = 1; i <= 6; i++) {
      const els = Array.from(document.querySelectorAll(`h${i}`));
      result[`h${i}`] = els.map((el) => ({
        text: text(el),
        empty: text(el).length === 0
      }));
    }
    return result;
  }

  function collectImages() {
    const imgs = Array.from(document.querySelectorAll('img'));
    return imgs.map((img) => ({
      src: img.getAttribute('src') || img.getAttribute('data-src') || '',
      alt: img.getAttribute('alt'),
      hasAlt: img.hasAttribute('alt'),
      altEmpty: img.hasAttribute('alt') && img.getAttribute('alt').trim() === '',
      width: img.naturalWidth || img.width || null,
      height: img.naturalHeight || img.height || null,
      loading: img.getAttribute('loading'),
      complete: img.complete && img.naturalWidth !== 0
    }));
  }

  function collectLinks() {
    const anchors = Array.from(document.querySelectorAll('a[href]'));
    const origin = location.origin;
    return anchors.map((a) => {
      const href = a.getAttribute('href') || '';
      let isInternal = false;
      let isEmail = false;
      let isTel = false;
      let isDownload = a.hasAttribute('download');
      try {
        if (href.startsWith('mailto:')) isEmail = true;
        else if (href.startsWith('tel:')) isTel = true;
        else if (href && !href.startsWith('javascript:') && href !== '#') {
          const resolved = new URL(href, location.href);
          isInternal = resolved.origin === origin;
        }
      } catch (e) {
        /* malformed href, ignore */
      }
      return {
        href,
        text: text(a),
        rel: a.getAttribute('rel') || '',
        nofollow: (a.getAttribute('rel') || '').includes('nofollow'),
        target: a.getAttribute('target'),
        isInternal,
        isExternal: !isInternal && !isEmail && !isTel && href !== '',
        isEmail,
        isTel,
        isDownload,
        isEmpty: href.trim() === '' || href.trim() === '#'
      };
    });
  }

  function collectStructuredData() {
    const scripts = Array.from(
      document.querySelectorAll('script[type="application/ld+json"]')
    );
    const items = [];
    scripts.forEach((s) => {
      try {
        const json = JSON.parse(s.textContent);
        const arr = Array.isArray(json) ? json : [json];
        arr.forEach((entry) => {
          const type = entry['@type'] || (entry['@graph'] ? 'Graph' : 'Unknown');
          items.push({ type, raw: entry });
        });
      } catch (e) {
        items.push({ type: 'Invalid JSON-LD', error: true });
      }
    });
    const microdataTypes = Array.from(
      document.querySelectorAll('[itemtype]')
    ).map((el) => el.getAttribute('itemtype'));
    return { jsonLd: items, microdataTypes };
  }

  function collectOpenGraph() {
    const props = [
      'og:title',
      'og:description',
      'og:image',
      'og:url',
      'og:type',
      'og:site_name'
    ];
    const result = {};
    props.forEach((p) => {
      result[p] = getMeta(p, 'property');
    });
    return result;
  }

  function collectTwitterCard() {
    const props = ['twitter:title', 'twitter:description', 'twitter:image', 'twitter:card'];
    const result = {};
    props.forEach((p) => {
      result[p] = getMeta(p);
    });
    return result;
  }

  function collectCanonical() {
    const links = Array.from(document.querySelectorAll('link[rel="canonical"]'));
    return links.map((l) => l.getAttribute('href'));
  }

  function collectPerformanceHints() {
    return {
      images: document.querySelectorAll('img').length,
      cssFiles: document.querySelectorAll('link[rel="stylesheet"]').length,
      jsFiles: document.querySelectorAll('script[src]').length,
      inlineScripts: document.querySelectorAll('script:not([src])').length,
      fonts: document.querySelectorAll(
        'link[as="font"], link[href*=".woff"], link[href*=".ttf"]'
      ).length,
      domElements: document.querySelectorAll('*').length,
      iframes: document.querySelectorAll('iframe').length
    };
  }

  function collectAccessibility() {
    const inputs = Array.from(document.querySelectorAll('input, textarea, select'));
    const missingLabels = inputs.filter((inp) => {
      if (inp.type === 'hidden' || inp.type === 'submit' || inp.type === 'button') return false;
      const id = inp.getAttribute('id');
      const hasLabel = id && document.querySelector(`label[for="${id}"]`);
      const hasAria = inp.getAttribute('aria-label') || inp.getAttribute('aria-labelledby');
      return !hasLabel && !hasAria;
    }).length;

    const buttons = Array.from(document.querySelectorAll('button'));
    const emptyButtons = buttons.filter(
      (b) => text(b) === '' && !b.getAttribute('aria-label') && !b.querySelector('img, svg')
    ).length;

    return {
      missingLabels,
      emptyButtons,
      htmlLang: document.documentElement.getAttribute('lang'),
      docTitle: !!text(document.querySelector('title'))
    };
  }

  function collectSecurity() {
    return {
      https: location.protocol === 'https:',
      passwordInputsOnHttp:
        location.protocol !== 'https:' && document.querySelectorAll('input[type="password"]').length > 0,
      inlineScriptCount: document.querySelectorAll('script:not([src])').length,
      iframeCount: document.querySelectorAll('iframe').length,
      mixedContentImages:
        location.protocol === 'https:'
          ? Array.from(document.querySelectorAll('img[src^="http://"]')).length
          : 0
    };
  }

  function collectMobile() {
    const viewport = getMeta('viewport');
    return {
      viewport,
      hasViewport: !!viewport,
      appleTouchIcon: !!document.querySelector('link[rel="apple-touch-icon"]'),
      manifest: !!document.querySelector('link[rel="manifest"]')
    };
  }

  function getWordStats() {
    const body = document.body ? document.body.innerText || '' : '';
    const words = body
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .filter((w) => w.length > 0);
    const freq = {};
    const stopwords = new Set([
      'the','a','an','and','or','but','of','to','in','on','for','with','is','are','was',
      'were','be','this','that','it','as','at','by','from','your','you','we','our'
    ]);
    words.forEach((w) => {
      const clean = w.toLowerCase().replace(/[^a-z0-9'-]/g, '');
      if (clean.length < 3 || stopwords.has(clean)) return;
      freq[clean] = (freq[clean] || 0) + 1;
    });
    const topKeywords = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([word, count]) => ({ word, count }));
    const wordCount = words.length;
    const readingTime = Math.max(1, Math.round(wordCount / 200));
    return {
      wordCount,
      charCount: body.length,
      readingTime,
      topKeywords,
      longestWords: [...words]
        .map((w) => w.replace(/[^a-zA-Z0-9'-]/g, ''))
        .filter((w) => w.length > 2)
        .sort((a, b) => b.length - a.length)
        .slice(0, 5)
    };
  }

  function detectCMS() {
    const html = document.documentElement.outerHTML;
    const generator = getMeta('generator');
    const signals = [];
    if (generator) signals.push(generator);
    if (window.wp || html.includes('wp-content') || html.includes('wp-includes')) signals.push('WordPress');
    if (html.includes('cdn.shopify.com') || window.Shopify) signals.push('Shopify');
    if (document.querySelector('#__next') || html.includes('__NEXT_DATA__')) signals.push('Next.js');
    if (document.querySelector('#root') && html.includes('react')) signals.push('React');
    if (html.includes('wix.com') || html.includes('wixstatic.com')) signals.push('Wix');
    if (html.includes('static.laravel') || document.querySelector('meta[name="csrf-token"]')) signals.push('Possibly Laravel');
    if (html.includes('cdn.shopify') ) signals.push('Shopify');
    if (window.ga || window.gtag || html.includes('googletagmanager.com')) signals.push('Google Analytics/Tag Manager');
    return signals;
  }

  const data = {
    url: location.href,
    origin: location.origin,
    protocol: location.protocol,
    title: text(document.querySelector('title')),
    favicon:
      document.querySelector('link[rel~="icon"]')?.href ||
      `${location.origin}/favicon.ico`,
    meta: {
      description: getMeta('description'),
      keywords: getMeta('keywords'),
      charset: document.characterSet,
      viewport: getMeta('viewport'),
      language: document.documentElement.getAttribute('lang'),
      author: getMeta('author'),
      robots: getMeta('robots')
    },
    headings: collectHeadings(),
    images: collectImages(),
    links: collectLinks(),
    openGraph: collectOpenGraph(),
    twitterCard: collectTwitterCard(),
    canonical: collectCanonical(),
    structuredData: collectStructuredData(),
    performance: collectPerformanceHints(),
    accessibility: collectAccessibility(),
    security: collectSecurity(),
    mobile: collectMobile(),
    wordStats: getWordStats(),
    cms: detectCMS(),
    timestamp: new Date().toISOString()
  };

  return data;
})();
