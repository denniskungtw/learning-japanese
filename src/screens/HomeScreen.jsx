import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import ProgressBar from '../components/ProgressBar';
import BottomNav from '../components/BottomNav';
import { hiragana } from '../data/hiragana';
import { katakana } from '../data/katakana';
import { vocabulary } from '../data/vocabulary';
import { mangaCharacters } from '../data/mangaCharacters';
import { fetchTakenNames } from '../utils/firebase';

export const APP_VERSION = '3.1';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function HomeScreen() {
  const { displayName, store, setDisplayName, syncToCloud } = useApp();
  const navigate = useNavigate();

  // Edit name modal state
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [loadingNames, setLoadingNames] = useState(false);

  if (!displayName) { navigate('/'); return null; }

  const hiraganaKnown = store.hiragana?.known?.length || 0;
  const katakanaKnown = store.katakana?.known?.length || 0;
  const quizScores = store.quizScores || [];
  const lastQuiz = quizScores[quizScores.length - 1];

  function openEditModal() {
    setEditName(displayName);
    setEditing(true);
    setCandidates([]);
    // Load candidates from cloud
    setLoadingNames(true);
    fetchTakenNames().then(taken => {
      const takenSet = new Set(taken);
      const avail = mangaCharacters.filter(n => !takenSet.has(n));
      setCandidates(shuffle(avail).slice(0, 5));
      setLoadingNames(false);
    }).catch(() => {
      setCandidates(shuffle([...mangaCharacters]).slice(0, 5));
      setLoadingNames(false);
    });
  }

  function confirmEdit(name) {
    if (!name || !name.trim()) return;
    setDisplayName(name.trim());
    setEditing(false);
  }

  function refreshCandidates() {
    fetchTakenNames().then(taken => {
      const takenSet = new Set(taken);
      const avail = mangaCharacters.filter(n => !takenSet.has(n));
      setCandidates(shuffle(avail).slice(0, 5));
    }).catch(() => {
      setCandidates(shuffle([...mangaCharacters]).slice(0, 5));
    });
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div>
              <p style={styles.greeting}>おはよう！</p>
              <h2 style={styles.userName}>{displayName}</h2>
            </div>
            <button onClick={openEditModal} style={styles.editBtn} title="更改名稱">✏️</button>
          </div>
          <button onClick={() => navigate('/help')} style={styles.helpBtn} title="使用說明">❓</button>
        </div>

        {/* Progress Cards */}
        <h3 style={styles.sectionTitle}>學習進度</h3>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardIcon}>あ</span>
            <span style={styles.cardTitle}>平假名</span>
          </div>
          <ProgressBar value={hiraganaKnown} max={hiragana.length} color="#e63946" />
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardIcon}>ア</span>
            <span style={styles.cardTitle}>片假名</span>
          </div>
          <ProgressBar value={katakanaKnown} max={katakana.length} color="#457b9d" />
        </div>

        {/* Quick Stats */}
        <h3 style={styles.sectionTitle}>今日統計</h3>
        <div style={styles.statsRow}>
          <div style={styles.statBox}>
            <span style={styles.statNum}>{hiraganaKnown + katakanaKnown}</span>
            <span style={styles.statLabel}>已學字符</span>
          </div>
          <div style={styles.statBox}>
            <span style={styles.statNum}>{quizScores.length}</span>
            <span style={styles.statLabel}>測驗次數</span>
          </div>
          <div style={styles.statBox}>
            <span style={styles.statNum}>{vocabulary.length}</span>
            <span style={styles.statLabel}>單字總數</span>
          </div>
        </div>

        {lastQuiz && (
          <div style={styles.lastQuizBanner}>
            <span>最近測驗：{quizTypeLabel(lastQuiz.type)}</span>
            <span style={{ fontWeight: 700 }}>{lastQuiz.score} / {lastQuiz.total} 分</span>
          </div>
        )}

        {/* Quick Actions */}
        <h3 style={styles.sectionTitle}>快速開始</h3>
        <div style={styles.quickRow}>
          <button onClick={() => navigate('/flashcards')} style={{ ...styles.quickBtn, background: '#e63946' }}>
            📇<br/>學習卡
          </button>
          <button onClick={() => navigate('/quiz')} style={{ ...styles.quickBtn, background: '#457b9d' }}>
            ✏️<br/>測驗
          </button>
          <button onClick={() => navigate('/leaderboard')} style={{ ...styles.quickBtn, background: '#2a9d8f' }}>
            🏆<br/>排行榜
          </button>
          <button onClick={() => navigate('/kana-chart')} style={{ ...styles.quickBtn, background: '#f4a261' }}>
            📊<br/>假名表
          </button>
        </div>

        {/* Version footer */}
        <div style={styles.versionFooter}>
          <span>Version {APP_VERSION}</span>
          <span style={styles.versionDot}>·</span>
          <span>@Author：Dennis Kung</span>
          <span style={styles.versionDot}>·</span>
          <span style={{ color: '#f4a261' }}>by Claude Code</span>
        </div>
      </div>
      <BottomNav />

      {/* Edit Name Modal */}
      {editing && (
        <div style={styles.modalOverlay} onClick={() => setEditing(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>更改名稱</h3>

            <div style={styles.modalInputRow}>
              <input
                value={editName}
                onChange={e => setEditName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && confirmEdit(editName)}
                style={styles.modalInput}
                maxLength={20}
                placeholder="輸入新名稱"
              />
              <button onClick={() => confirmEdit(editName)} style={styles.modalGoBtn}>確認</button>
            </div>

            <p style={styles.modalLabel}>或選擇角色名</p>
            {loadingNames ? (
              <p style={styles.modalLoadingText}>載入中...</p>
            ) : (
              <>
                <div style={styles.modalCharGrid}>
                  {candidates.map(n => (
                    <button key={n} onClick={() => confirmEdit(n)} style={styles.modalCharBtn}>{n}</button>
                  ))}
                </div>
                {candidates.length > 0 && (
                  <button onClick={refreshCandidates} style={styles.modalRefreshBtn}>🔄 換一批</button>
                )}
              </>
            )}

            <button onClick={() => setEditing(false)} style={styles.modalCloseBtn}>取消</button>
          </div>
        </div>
      )}
    </div>
  );
}

function quizTypeLabel(type) {
  if (type === 'multiChoice') return '發音測驗';
  if (type === 'kanaConvert') return '假名轉換';
  if (type === 'chineseToJp') return '單字測驗';
  if (type === 'confusable') return '混淆字';
  if (type === 'placeName') return '常見地名';
  if (type === 'foodMenu') return '菜單點餐';
  return type;
}

const styles = {
  page: { minHeight: '100vh', background: '#f8f8f8', paddingBottom: 80 },
  container: { maxWidth: 430, margin: '0 auto', padding: '20px 16px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  greeting: { margin: 0, fontSize: 14, color: '#999' },
  userName: { margin: '4px 0 0', fontSize: 24, fontWeight: 800, color: '#222' },
  editBtn: {
    width: 30, height: 30, borderRadius: '50%', border: '1.5px solid #ddd',
    background: '#fff', fontSize: 14, cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center', padding: 0, marginTop: 4,
  },
  helpBtn: {
    width: 34, height: 34, borderRadius: '50%', border: '1.5px solid #ddd',
    background: '#fff', fontSize: 16, cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center', padding: 0,
  },
  sectionTitle: { fontSize: 16, fontWeight: 700, color: '#444', margin: '20px 0 10px' },
  card: {
    background: '#fff', borderRadius: 14, padding: '16px', marginBottom: 12,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  cardHeader: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 },
  cardIcon: { fontSize: 24, fontWeight: 700 },
  cardTitle: { fontSize: 16, fontWeight: 600, color: '#333' },
  statsRow: { display: 'flex', gap: 10, marginBottom: 12 },
  statBox: {
    flex: 1, background: '#fff', borderRadius: 12, padding: '14px 8px',
    textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    display: 'flex', flexDirection: 'column', gap: 4,
  },
  statNum: { fontSize: 28, fontWeight: 900, color: '#e63946' },
  statLabel: { fontSize: 12, color: '#999' },
  lastQuizBanner: {
    background: '#fff3cd', borderRadius: 10, padding: '10px 14px',
    display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8,
  },
  quickRow: { display: 'flex', gap: 10 },
  quickBtn: {
    flex: 1, borderRadius: 14, border: 'none', padding: '18px 0',
    color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
    lineHeight: 1.8,
  },
  versionFooter: {
    marginTop: 28, textAlign: 'center', fontSize: 11, color: '#bbb',
    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6,
  },
  versionDot: { color: '#ddd' },
  // Modal styles
  modalOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 999, padding: 20,
  },
  modal: {
    background: '#fff', borderRadius: 20, padding: '24px 20px',
    width: '100%', maxWidth: 360, boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
  },
  modalTitle: { margin: '0 0 16px', fontSize: 18, fontWeight: 800, color: '#222', textAlign: 'center' },
  modalInputRow: { display: 'flex', gap: 8, marginBottom: 16 },
  modalInput: {
    flex: 1, border: '2px solid #e63946', borderRadius: 10, padding: '10px 14px',
    fontSize: 16, outline: 'none', boxSizing: 'border-box',
  },
  modalGoBtn: {
    padding: '10px 16px', borderRadius: 10, border: 'none',
    background: '#e63946', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
  },
  modalLabel: { fontSize: 13, color: '#999', margin: '0 0 10px', textAlign: 'center' },
  modalLoadingText: { textAlign: 'center', color: '#999', fontSize: 13 },
  modalCharGrid: { display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 10 },
  modalCharBtn: {
    padding: '8px 14px', borderRadius: 10, border: '1.5px solid #e63946',
    background: '#fff', color: '#e63946', fontSize: 14, fontWeight: 700, cursor: 'pointer',
  },
  modalRefreshBtn: {
    display: 'block', margin: '0 auto 12px', padding: '6px 16px',
    borderRadius: 16, border: '1px solid #ddd', background: '#f8f8f8',
    color: '#666', fontSize: 12, cursor: 'pointer',
  },
  modalCloseBtn: {
    width: '100%', padding: '10px 0', borderRadius: 10,
    border: '1.5px solid #ccc', background: '#fff', color: '#666',
    fontSize: 14, cursor: 'pointer',
  },
};
