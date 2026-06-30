// useStorage.js — thin React wrapper around chrome.storage.local

import { useCallback, useEffect, useState } from 'react';

export function useStorage(key, defaultValue) {
  const [value, setValue] = useState(defaultValue);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof chrome === 'undefined' || !chrome.storage) {
      setLoaded(true);
      return;
    }
    chrome.storage.local.get([key], (res) => {
      if (res && res[key] !== undefined) setValue(res[key]);
      setLoaded(true);
    });
  }, [key]);

  const update = useCallback(
    (newValue) => {
      setValue(newValue);
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.set({ [key]: newValue });
      }
    },
    [key]
  );

  return [value, update, loaded];
}
