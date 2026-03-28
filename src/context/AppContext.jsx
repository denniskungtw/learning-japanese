import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { syncScore } from '../utils/firebase';

const AppContext = createContext(null);

const DEFAULT_DATA = {
  displayName: null,
  hiragana: { known: [] },
  katakana: { known: [] },
  quizScores: [],
  version: '2.0',
};

/* ── Device ID (UUID v4) ── */
function getDeviceId() {
  let id = localStorage.getItem('jp-device-id');
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : (
      'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      })
    );
    localStorage.setItem('jp-device-id', id);
  }
  return id;
}

/* ── localStorage helpers ── */
function loadStorage() {
  try {
    const raw = localStorage.getItem('jp-app');
    if (!raw) return null;
    const data = JSON.parse(raw);

    // Migrate from v1 multi-user format
    if (data.users && Array.isArray(data.users)) {
      const userName = data.currentUser || data.users[0];
      if (!userName) return null;
      const ud = data.userData?.[userName] || {};
      return {
        displayName: userName,
        hiragana: ud.hiragana || { known: [] },
        katakana: ud.katakana || { known: [] },
        quizScores: ud.quizScores || [],
        version: '2.0',
      };
    }

    // Already v2 format
    if (data.version === '2.0') return data;
    return null;
  } catch {
    return null;
  }
}

function saveStorage(data) {
  localStorage.setItem('jp-app', JSON.stringify(data));
}

/* ── Provider ── */
export function AppProvider({ children }) {
  const [store, setStore] = useState(() => loadStorage() || { ...DEFAULT_DATA });
  const deviceId = useRef(getDeviceId());
  const syncTimer = useRef(null);

  // Persist to localStorage on every change
  useEffect(() => {
    saveStorage(store);
  }, [store]);

  // Debounced cloud sync
  const syncToCloud = useCallback(() => {
    if (!store.displayName) return;
    clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      const total = computeTotalScore(store);
      syncScore(deviceId.current, store.displayName, total).catch(() => {});
    }, 1000);
  }, [store]);

  // Sync on online event
  useEffect(() => {
    const handler = () => syncToCloud();
    window.addEventListener('online', handler);
    return () => window.removeEventListener('online', handler);
  }, [syncToCloud]);

  function setDisplayName(name) {
    setStore(s => {
      const next = { ...s, displayName: name };
      // Immediately sync to cloud
      setTimeout(() => {
        const total = computeTotalScore(next);
        syncScore(deviceId.current, name, total).catch(() => {});
      }, 100);
      return next;
    });
  }

  function markKnown(deck, char) {
    setStore(s => {
      const deckData = s[deck] || { known: [] };
      if (deckData.known.includes(char)) return s;
      const next = { ...s, [deck]: { ...deckData, known: [...deckData.known, char] } };
      return next;
    });
    // Trigger debounced sync
    setTimeout(syncToCloud, 0);
  }

  function markUnknown(deck, char) {
    setStore(s => {
      const deckData = s[deck] || { known: [] };
      const known = deckData.known.filter(c => c !== char);
      return { ...s, [deck]: { ...deckData, known } };
    });
    setTimeout(syncToCloud, 0);
  }

  function saveQuizScore(type, score, total) {
    setStore(s => {
      const entry = { type, score, total, date: new Date().toLocaleDateString('zh-TW') };
      return { ...s, quizScores: [...(s.quizScores || []), entry] };
    });
    setTimeout(syncToCloud, 0);
  }

  function getTotalScore() {
    return computeTotalScore(store);
  }

  return (
    <AppContext.Provider value={{
      store,
      deviceId: deviceId.current,
      displayName: store.displayName,
      setDisplayName,
      markKnown,
      markUnknown,
      saveQuizScore,
      getTotalScore,
      syncToCloud,
    }}>
      {children}
    </AppContext.Provider>
  );
}

function computeTotalScore(data) {
  const h = data.hiragana?.known?.length || 0;
  const k = data.katakana?.known?.length || 0;
  const q = (data.quizScores || []).reduce((sum, qs) => sum + qs.score, 0);
  return h + k + q;
}

export function useApp() {
  return useContext(AppContext);
}
