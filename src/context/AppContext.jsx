import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext(null);

const DEFAULT_USER_DATA = {
  hiragana: { known: [] },
  katakana: { known: [] },
  quizScores: [],  // [{ type, score, total, date }]
};

function loadStorage() {
  try {
    const raw = localStorage.getItem('jp-app');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveStorage(data) {
  localStorage.setItem('jp-app', JSON.stringify(data));
}

export function AppProvider({ children }) {
  const [store, setStore] = useState(() => {
    const saved = loadStorage();
    return saved || { users: [], currentUser: null, userData: {} };
  });

  useEffect(() => {
    saveStorage(store);
  }, [store]);

  const currentUserData = store.currentUser
    ? (store.userData[store.currentUser] || DEFAULT_USER_DATA)
    : null;

  function selectUser(name) {
    setStore(s => ({
      ...s,
      currentUser: name,
      userData: s.userData[name]
        ? s.userData
        : { ...s.userData, [name]: { ...DEFAULT_USER_DATA, hiragana: { known: [] }, katakana: { known: [] }, quizScores: [] } },
    }));
  }

  function addUser(name) {
    const trimmed = name.trim();
    if (!trimmed || store.users.includes(trimmed) || store.users.length >= 10) return false;
    setStore(s => ({
      ...s,
      users: [...s.users, trimmed],
      userData: {
        ...s.userData,
        [trimmed]: { hiragana: { known: [] }, katakana: { known: [] }, quizScores: [] },
      },
    }));
    return true;
  }

  function deleteUser(name) {
    setStore(s => {
      const users = s.users.filter(u => u !== name);
      const userData = { ...s.userData };
      delete userData[name];
      return {
        ...s,
        users,
        userData,
        currentUser: s.currentUser === name ? null : s.currentUser,
      };
    });
  }

  function markKnown(deck, char) {
    setStore(s => {
      const user = s.currentUser;
      if (!user) return s;
      const deckData = s.userData[user]?.[deck] || { known: [] };
      const known = deckData.known.includes(char)
        ? deckData.known
        : [...deckData.known, char];
      return {
        ...s,
        userData: {
          ...s.userData,
          [user]: { ...s.userData[user], [deck]: { ...deckData, known } },
        },
      };
    });
  }

  function markUnknown(deck, char) {
    setStore(s => {
      const user = s.currentUser;
      if (!user) return s;
      const deckData = s.userData[user]?.[deck] || { known: [] };
      const known = deckData.known.filter(c => c !== char);
      return {
        ...s,
        userData: {
          ...s.userData,
          [user]: { ...s.userData[user], [deck]: { ...deckData, known } },
        },
      };
    });
  }

  function saveQuizScore(type, score, total) {
    setStore(s => {
      const user = s.currentUser;
      if (!user) return s;
      const prev = s.userData[user]?.quizScores || [];
      const entry = { type, score, total, date: new Date().toLocaleDateString('zh-TW') };
      return {
        ...s,
        userData: {
          ...s.userData,
          [user]: { ...s.userData[user], quizScores: [...prev, entry] },
        },
      };
    });
  }

  function getTotalScore(userName) {
    const data = store.userData[userName];
    if (!data) return 0;
    const hiraganaScore = (data.hiragana?.known?.length || 0);
    const katakanaScore = (data.katakana?.known?.length || 0);
    const quizTotal = (data.quizScores || []).reduce((sum, q) => sum + q.score, 0);
    return hiraganaScore + katakanaScore + quizTotal;
  }

  return (
    <AppContext.Provider value={{
      store,
      currentUser: store.currentUser,
      currentUserData,
      selectUser,
      addUser,
      deleteUser,
      markKnown,
      markUnknown,
      saveQuizScore,
      getTotalScore,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
