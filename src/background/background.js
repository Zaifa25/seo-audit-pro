// background.js — MV3 service worker
// Handles messaging between the popup and the content script, and performs
// the audit by injecting content.js into the active tab via the Scripting API.

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['theme'], (res) => {
    if (!res.theme) {
      chrome.storage.local.set({ theme: 'light' });
    }
  });
});

async function runAudit(tabId) {
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId },
    files: ['content/content.js']
  });
  return result;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'RUN_AUDIT') {
    (async () => {
      try {
        const tabId = message.tabId;
        const data = await runAudit(tabId);
        sendResponse({ ok: true, data });
      } catch (err) {
        sendResponse({ ok: false, error: err?.message || String(err) });
      }
    })();
    return true; // keep the message channel open for async response
  }

  if (message?.type === 'FETCH_TEXT') {
    (async () => {
      try {
        const res = await fetch(message.url, { method: 'GET' });
        const ok = res.ok;
        const text = ok ? await res.text() : '';
        sendResponse({ ok, status: res.status, text });
      } catch (err) {
        sendResponse({ ok: false, error: err?.message || String(err) });
      }
    })();
    return true;
  }
});
