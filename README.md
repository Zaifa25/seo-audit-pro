# SEO Audit Pro

A professional Chrome Extension (Manifest V3) that performs a complete on-page SEO audit of any website in a single click — no backend, no tracking, everything runs locally in your browser.

## Overview

SEO Audit Pro inspects the live DOM of the active tab and generates a weighted SEO score (0–100) along with a category-by-category breakdown covering meta tags, headings, images, links, social meta, structured data, performance, accessibility, security, mobile-readiness, and more. Every failed check comes with a plain-language explanation and a concrete fix.

## Features

- One-click audit of any webpage via the Chrome Tabs + Scripting APIs
- Weighted overall SEO score with animated circular progress ring
- 14+ audit categories: Meta, Headings, Images, Links, Open Graph, Twitter Cards, Canonical, Robots/Indexability, Structured Data (JSON-LD/microdata), Performance, Accessibility, Security, Mobile SEO, URL Analysis
- Keyword analysis: word count, reading time, top keywords, longest words
- Severity-ranked Recommendations tab (High/Medium/Low) with filtering
- Export reports as **PDF, JSON, CSV, TXT, or Markdown**; copy-to-clipboard and print support
- Scan history stored locally via `chrome.storage.local`
- Light/Dark theme, persisted across sessions
- Instant search/filter across audit sections
- Lightweight CMS/framework/analytics detection (WordPress, Shopify, Next.js, React, Wix, GA/GTM, etc.)
- 100% client-side — no servers, no data collection

## Technologies

- React 19 + Vite 6
- Bootstrap 5 + Bootstrap Icons
- Chrome Extension Manifest V3 (`activeTab`, `scripting`, `tabs`, `storage`)
- jsPDF, FileSaver.js, PapaParse for export

## Folder Structure

```text
seo-audit-pro/
├─ public/
│  ├─ manifest.json
│  └─ icons/
├─ src/
│  ├─ components/        # One folder per UI section (Header, Dashboard, MetaSection, ...)
│  ├─ hooks/              # useAudit, useStorage
│  ├─ services/           # analyzer.js, seoScore.js, exporter.js
│  ├─ utils/               # constants.js, helpers.js
│  ├─ content/content.js  # Injected into the page to read the DOM
│  ├─ background/background.js  # MV3 service worker
│  ├─ App.jsx / main.jsx / index.css
├─ popup.html
├─ vite.config.js
└─ package.json
```

## Installation & Build

```bash
npm install
npm run build
```

This produces a `dist/` folder containing the unpacked extension (popup, background, content script, manifest, and icons already in the correct relative paths).

## Loading into Chrome

1. Run `npm run build`.
2. Open `chrome://extensions` in Chrome.
3. Enable **Developer mode** (top right).
4. Click **Load unpacked** and select the `dist/` folder.
5. Pin the extension and click its icon on any website to run an audit.

## Usage

1. Navigate to the page you want to audit.
2. Click the SEO Audit Pro icon — the audit runs automatically.
3. Browse Overview, Audit Details, Recommendations, History, and Export tabs.
4. Use the search bar to jump to a specific audit section.
5. Export your report in the format you need from the **Export** tab.

## Permissions

Only the minimum required permissions are requested: `activeTab`, `scripting`, `tabs`, `storage`. The extension never sends data anywhere — all analysis happens in your browser.

## Future Improvements

- Highlight flagged elements directly on the page
- robots.txt / sitemap.xml fetch-and-parse checks
- Compare two scans of the same page over time
- Core Web Vitals summary via the Performance/Navigation Timing APIs
- AI-generated SEO suggestions (optional, opt-in)

## License

MIT — free to use, modify, and distribute.
