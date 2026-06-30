import React, { useEffect, useMemo, useState } from 'react';
import Header from './components/Header/Header.jsx';
import Footer from './components/Footer/Footer.jsx';
import Sidebar, { TABS } from './components/Sidebar/Sidebar.jsx';
import Dashboard from './components/Dashboard/Dashboard.jsx';
import Recommendations from './components/Recommendations/Recommendations.jsx';
import ExportSection from './components/ExportSection/ExportSection.jsx';
import HistoryPanel from './components/HistoryPanel.jsx';
import KeywordSection from './components/KeywordSection/KeywordSection.jsx';

import MetaSection from './components/MetaSection/MetaSection.jsx';
import HeadingSection from './components/HeadingSection/HeadingSection.jsx';
import ImagesSection from './components/ImagesSection/ImagesSection.jsx';
import LinksSection from './components/LinksSection/LinksSection.jsx';
import OpenGraphSection from './components/OpenGraphSection/OpenGraphSection.jsx';
import TwitterCardSection from './components/TwitterCardSection/TwitterCardSection.jsx';
import CanonicalSection from './components/CanonicalSection/CanonicalSection.jsx';
import RobotsSection from './components/RobotsSection/RobotsSection.jsx';
import StructuredDataSection from './components/StructuredDataSection/StructuredDataSection.jsx';
import PerformanceSection from './components/PerformanceSection/PerformanceSection.jsx';
import AccessibilitySection from './components/AccessibilitySection/AccessibilitySection.jsx';
import SecuritySection from './components/SecuritySection/SecuritySection.jsx';
import MobileSEOSection from './components/MobileSEOSection/MobileSEOSection.jsx';
import URLSection from './components/URLSection/URLSection.jsx';

import { useAudit } from './hooks/useAudit.js';
import { useStorage } from './hooks/useStorage.js';
import { CATEGORY_LABELS } from './utils/constants.js';

const SECTION_COMPONENTS = [
  { key: 'meta', Comp: MetaSection },
  { key: 'headings', Comp: HeadingSection },
  { key: 'images', Comp: ImagesSection },
  { key: 'links', Comp: LinksSection },
  { key: 'openGraph', Comp: OpenGraphSection },
  { key: 'twitterCard', Comp: TwitterCardSection },
  { key: 'canonical', Comp: CanonicalSection },
  { key: 'robots', Comp: RobotsSection },
  { key: 'structuredData', Comp: StructuredDataSection },
  { key: 'performance', Comp: PerformanceSection },
  { key: 'accessibility', Comp: AccessibilitySection },
  { key: 'security', Comp: SecuritySection },
  { key: 'mobile', Comp: MobileSEOSection },
  { key: 'url', Comp: URLSection }
];

export default function App() {
  const { loading, error, rawData, audit, score, runAudit } = useAudit();
  const [darkMode, setDarkMode] = useStorage('theme', 'light');
  const [tab, setTab] = useState('overview');
  const [search, setSearch] = useState('');

  useEffect(() => {
    runAudit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode === 'dark' ? 'dark' : 'light');
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(darkMode === 'dark' ? 'light' : 'dark');

  const visibleSections = useMemo(() => {
    if (!search.trim()) return SECTION_COMPONENTS;
    const q = search.toLowerCase();
    return SECTION_COMPONENTS.filter((s) => (CATEGORY_LABELS[s.key] || s.key).toLowerCase().includes(q));
  }, [search]);

  return (
    <div>
      <Header darkMode={darkMode === 'dark'} onToggleTheme={toggleTheme} onRescan={runAudit} loading={loading} />

      <div className="app-body">
        {loading && (
          <div className="empty-state">
            <div className="spinner-border text-primary" role="status"></div>
            <div className="mt-2 text-muted">Scanning page…</div>
          </div>
        )}

        {!loading && error && (
          <div className="alert alert-danger small">
            <i className="bi bi-exclamation-octagon me-1"></i>{error}
          </div>
        )}

        {!loading && !error && rawData && audit && score && (
          <>
            <Sidebar active={tab} onChange={setTab} search={search} onSearch={setSearch} />

            {tab === 'overview' && (
              <>
                <Dashboard rawData={rawData} score={score} />
                {rawData.cms && rawData.cms.length > 0 && (
                  <div className="card mb-3">
                    <div className="card-body py-2">
                      <div className="small fw-semibold mb-1"><i className="bi bi-cpu me-1"></i>Detected Technology</div>
                      <div className="d-flex flex-wrap gap-1">
                        {rawData.cms.map((c, i) => (
                          <span key={i} className="badge bg-secondary-subtle text-secondary-emphasis">{c}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {tab === 'audit' && (
              <div>
                {visibleSections.map(({ key, Comp }) => (
                  <Comp key={key} audit={audit} />
                ))}
                <KeywordSection rawData={rawData} />
              </div>
            )}

            {tab === 'recommendations' && <Recommendations audit={audit} />}

            {tab === 'history' && <HistoryPanel />}

            {tab === 'export' && <ExportSection rawData={rawData} audit={audit} score={score} />}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
