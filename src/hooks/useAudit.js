// useAudit.js — orchestrates: get active tab -> ask background to inject
// content.js -> run analyzer -> compute score -> save to history.

import { useCallback, useState } from 'react';
import { runFullAudit } from '../services/analyzer.js';
import { computeOverallScore } from '../services/seoScore.js';

const HISTORY_KEY = 'seoAuditHistory';
const MAX_HISTORY = 20;

function isExtensionContext() {
  return typeof chrome !== 'undefined' && !!chrome.tabs && !!chrome.runtime;
}

async function saveToHistory(entry) {
  if (typeof chrome === 'undefined' || !chrome.storage) return;
  chrome.storage.local.get([HISTORY_KEY], (res) => {
    const list = res[HISTORY_KEY] || [];
    list.unshift(entry);
    chrome.storage.local.set({ [HISTORY_KEY]: list.slice(0, MAX_HISTORY) });
  });
}

export function useAudit() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rawData, setRawData] = useState(null);
  const [audit, setAudit] = useState(null);
  const [score, setScore] = useState(null);

  const runAudit = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!isExtensionContext()) {
        throw new Error('Not running inside a Chrome extension context.');
      }

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) throw new Error('Could not find an active tab.');
      if (tab.url && (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('https://chrome.google.com/webstore'))) {
        throw new Error('This page cannot be audited (restricted Chrome page). Try a regular website.');
      }

      const response = await chrome.runtime.sendMessage({ type: 'RUN_AUDIT', tabId: tab.id });
      if (!response || !response.ok) {
        throw new Error(response?.error || 'Failed to run audit.');
      }

      const data = response.data;
      const result = runFullAudit(data);
      const scoreResult = computeOverallScore(result);

      setRawData(data);
      setAudit(result);
      setScore(scoreResult);

      saveToHistory({
        url: data.url,
        title: data.title,
        favicon: data.favicon,
        score: scoreResult.overall,
        date: new Date().toISOString()
      });
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, rawData, audit, score, runAudit };
}
