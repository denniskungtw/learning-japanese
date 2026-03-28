import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { mangaCharacters } from '../data/mangaCharacters';
import { fetchTakenNames } from '../utils/firebase';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function UserSelectScreen() {
  const { setDisplayName } = useApp();
  const navigate = useNavigate();
  const [customName, setCustomName] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [available, setAvailable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load taken names from cloud and compute available candidates
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const taken = await fetchTakenNames();
        const takenSet = new Set(taken);
        const avail = mangaCharacters.filter(n => !takenSet.has(n));
        if (!cancelled) {
          setAvailable(avail);
          setCandidates(shuffle(avail).slice(0, 5));
          setLoading(false);
        }
      } catch {
        // Offline — show all characters
        if (!cancelled) {
          setAvailable([...mangaCharacters]);
          setCandidates(shuffle([...mangaCharacters]).slice(0, 5));
          setLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  function refreshCandidates() {
    setCandidates(shuffle(available).slice(0, 5));
  }

  function handleCustomSubmit() {
    const name = customName.trim();
    if (!name) { setError('請輸入名稱'); return; }
    if (name.length > 20) { setError('名稱最多 20 個字'); return; }
    confirmName(name);
  }

  function confirmName(name) {
    setDisplayName(name);
    navigate('/home');
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.logo}>🇯🇵</div>
        <h1 style={styles.title}>學日語</h1>
        <p style={styles.subtitle}>歡迎！請選擇你的名字</p>
      </div>

      {/* Custom name input */}
      <div style={styles.section}>
        <p style={styles.sectionLabel}>自訂名稱</p>
        <div style={styles.inputRow}>
          <input
            value={customName}
            onChange={e => { setCustomName(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleCustomSubmit()}
            placeholder="輸入你的名稱"
            style={styles.input}
            maxLength={20}
          />
          <button onClick={handleCustomSubmit} style={styles.goBtn}>確認</button>
        </div>
        {error && <p style={styles.error}>{error}</p>}
      </div>

      {/* Divider */}
      <div style={styles.divider}>
        <span style={styles.dividerText}>或選擇一個角色名</span>
      </div>

      {/* Manga character candidates */}
      <div style={styles.section}>
        {loading ? (
          <p style={styles.loadingText}>載入中...</p>
        ) : candidates.length === 0 ? (
          <p style={styles.loadingText}>所有角色名都被選走了，請自訂名稱</p>
        ) : (
          <>
            <div style={styles.charGrid}>
              {candidates.map(name => (
                <button
                  key={name}
                  onClick={() => confirmName(name)}
                  style={styles.charBtn}
                >
                  {name}
                </button>
              ))}
            </div>
            {available.length > 5 && (
              <button onClick={refreshCandidates} style={styles.refreshBtn}>
                🔄 換一批
              </button>
            )}
          </>
        )}
      </div>

      <p style={styles.footNote}>
        💡 名字之後可以隨時更改
      </p>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh', background: 'linear-gradient(135deg, #e63946 0%, #c1121f 100%)',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '40px 20px', boxSizing: 'border-box',
  },
  header: { textAlign: 'center', marginBottom: 32 },
  logo: { fontSize: 64, marginBottom: 8 },
  title: { color: '#fff', fontSize: 36, fontWeight: 900, margin: 0, letterSpacing: 4 },
  subtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 16, margin: '8px 0 0' },
  section: { width: '100%', maxWidth: 360 },
  sectionLabel: { color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: 600, margin: '0 0 8px' },
  inputRow: { display: 'flex', gap: 8 },
  input: {
    flex: 1, border: 'none', borderRadius: 12, padding: '12px 16px',
    fontSize: 16, outline: 'none', boxSizing: 'border-box',
  },
  goBtn: {
    padding: '12px 20px', borderRadius: 12, border: 'none',
    background: '#fff', color: '#e63946', fontSize: 15, fontWeight: 700, cursor: 'pointer',
  },
  error: { color: '#ffd', fontSize: 13, margin: '6px 0 0' },
  divider: {
    width: '100%', maxWidth: 360, textAlign: 'center',
    margin: '24px 0', position: 'relative',
  },
  dividerText: {
    background: 'transparent', color: 'rgba(255,255,255,0.7)',
    fontSize: 13, padding: '0 12px', position: 'relative',
  },
  charGrid: {
    display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center',
  },
  charBtn: {
    padding: '12px 18px', borderRadius: 12, border: 'none',
    background: 'rgba(255,255,255,0.95)', color: '#222',
    fontSize: 16, fontWeight: 700, cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    transition: 'transform 0.1s',
  },
  refreshBtn: {
    display: 'block', margin: '16px auto 0', padding: '10px 24px',
    borderRadius: 20, border: '2px solid rgba(255,255,255,0.5)',
    background: 'transparent', color: '#fff', fontSize: 14,
    cursor: 'pointer', fontWeight: 600,
  },
  loadingText: { color: 'rgba(255,255,255,0.8)', textAlign: 'center', fontSize: 14 },
  footNote: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 24 },
};
