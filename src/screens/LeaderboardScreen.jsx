import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { fetchLeaderboard } from '../utils/firebase';
import { hiragana } from '../data/hiragana';
import { katakana } from '../data/katakana';
import BottomNav from '../components/BottomNav';

const CACHE_KEY = 'jp-leaderboard-cache';

export default function LeaderboardScreen() {
  const { displayName, store, deviceId, getTotalScore } = useApp();
  const navigate = useNavigate();

  const [ranked, setRanked] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offline, setOffline] = useState(false);

  if (!displayName) { navigate('/'); return null; }

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    setOffline(false);
    try {
      const data = await fetchLeaderboard();
      setRanked(data);
      // Cache for offline
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch {}
      setLoading(false);
    } catch (e) {
      // Try cached data
      try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || '[]');
        if (cached.length > 0) {
          setRanked(cached);
          setOffline(true);
        } else {
          setError('無法連線到雲端');
        }
      } catch {
        setError('無法連線到雲端');
      }
      setLoading(false);
    }
  }

  const medals = ['🥇', '🥈', '🥉'];

  // Local user details
  const myHiragana = store.hiragana?.known?.length || 0;
  const myKatakana = store.katakana?.known?.length || 0;
  const myQuizCount = store.quizScores?.length || 0;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.title}>🏆 排行榜</h2>
        <p style={styles.subtitle}>全球學習排名</p>

        {offline && (
          <div style={styles.offlineBadge}>
            📡 離線模式 — 顯示上次快取的資料
            <button onClick={loadData} style={styles.retrySmall}>重試</button>
          </div>
        )}

        {loading ? (
          <div style={styles.loadingBox}>
            <div style={styles.spinner} />
            <p>載入排行榜...</p>
          </div>
        ) : error ? (
          <div style={styles.errorBox}>
            <p>⚠️ {error}</p>
            <button onClick={loadData} style={styles.retryBtn}>重新載入</button>
          </div>
        ) : ranked.length === 0 ? (
          <div style={styles.emptyBox}>
            <p>目前沒有排行資料</p>
            <p style={{ fontSize: 13, color: '#999' }}>開始學習後，你的成績會自動上傳！</p>
          </div>
        ) : (
          <>
            {/* Top 3 podium */}
            {ranked.length >= 3 && (
              <div style={styles.podium}>
                {[ranked[1], ranked[0], ranked[2]].map((u, podiumIdx) => {
                  const actualRank = podiumIdx === 1 ? 0 : podiumIdx === 0 ? 1 : 2;
                  const heights = [80, 110, 60];
                  const isMe = u.id === deviceId;
                  return (
                    <div key={u.id} style={{
                      ...styles.podiumItem,
                      height: heights[podiumIdx],
                      ...(isMe ? { border: '2px solid #e63946' } : {}),
                    }}>
                      <div style={styles.podiumMedal}>{medals[actualRank]}</div>
                      <div style={styles.podiumName}>
                        {u.name}
                        {isMe && <span style={styles.meBadge}>我</span>}
                      </div>
                      <div style={styles.podiumScore}>{u.totalScore}</div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Full list */}
            <div style={styles.list}>
              {ranked.map((u, i) => {
                const isMe = u.id === deviceId;
                return (
                  <div
                    key={u.id}
                    style={{
                      ...styles.row,
                      background: isMe ? '#fff7f7' : '#fff',
                      borderColor: isMe ? '#e63946' : '#eee',
                    }}
                  >
                    <span style={styles.rank}>{medals[i] || `${i + 1}`}</span>
                    <div style={styles.rowMain}>
                      <div style={styles.rowName}>
                        {u.name}
                        {isMe && <span style={styles.youBadge}>我</span>}
                      </div>
                      {/* Only show details for self */}
                      {isMe && (
                        <div style={styles.rowDetails}>
                          あ {myHiragana}/{hiragana.length} &nbsp;·&nbsp;
                          ア {myKatakana}/{katakana.length} &nbsp;·&nbsp;
                          測驗 {myQuizCount} 次
                        </div>
                      )}
                    </div>
                    <div style={styles.totalScore}>{u.totalScore}</div>
                  </div>
                );
              })}
            </div>

            <div style={styles.note}>
              <p style={styles.noteText}>
                積分計算：每學會1個字符 = 1分，每次測驗答對 = 1分
              </p>
            </div>
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f8f8f8', paddingBottom: 80 },
  container: { maxWidth: 430, margin: '0 auto', padding: '20px 16px' },
  title: { fontSize: 24, fontWeight: 800, margin: '0 0 4px', color: '#222' },
  subtitle: { fontSize: 14, color: '#999', margin: '0 0 20px' },
  offlineBadge: {
    background: '#fff3cd', borderRadius: 10, padding: '8px 14px',
    fontSize: 13, color: '#856404', marginBottom: 16, textAlign: 'center',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  retrySmall: {
    padding: '4px 10px', borderRadius: 8, border: '1px solid #856404',
    background: 'transparent', color: '#856404', fontSize: 12, cursor: 'pointer',
  },
  loadingBox: { textAlign: 'center', padding: 40, color: '#999' },
  spinner: {
    width: 32, height: 32, border: '3px solid #eee', borderTop: '3px solid #e63946',
    borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px',
  },
  errorBox: { textAlign: 'center', padding: 40, color: '#e63946' },
  retryBtn: {
    marginTop: 12, padding: '10px 24px', borderRadius: 10, border: 'none',
    background: '#e63946', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
  },
  emptyBox: { textAlign: 'center', color: '#999', padding: 40 },
  podium: {
    display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 8, marginBottom: 20,
  },
  podiumItem: {
    flex: 1, maxWidth: 110, background: '#fff', borderRadius: '12px 12px 0 0',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
    padding: '12px 8px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
  },
  podiumMedal: { fontSize: 28 },
  podiumName: { fontSize: 13, fontWeight: 700, color: '#333', marginTop: 4, textAlign: 'center' },
  podiumScore: { fontSize: 18, fontWeight: 900, color: '#e63946' },
  meBadge: {
    fontSize: 9, background: '#e63946', color: '#fff',
    borderRadius: 4, padding: '1px 4px', marginLeft: 4, verticalAlign: 'middle',
  },
  list: { display: 'flex', flexDirection: 'column', gap: 10 },
  row: {
    display: 'flex', alignItems: 'center', gap: 12,
    background: '#fff', borderRadius: 12, padding: '14px 14px',
    border: '1.5px solid', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  },
  rank: { fontSize: 22, width: 30, textAlign: 'center', flexShrink: 0 },
  rowMain: { flex: 1 },
  rowName: { fontSize: 16, fontWeight: 700, color: '#222', display: 'flex', alignItems: 'center', gap: 8 },
  youBadge: {
    fontSize: 11, background: '#e63946', color: '#fff',
    borderRadius: 6, padding: '1px 6px', fontWeight: 700,
  },
  rowDetails: { fontSize: 12, color: '#999', marginTop: 2 },
  totalScore: { fontSize: 22, fontWeight: 900, color: '#e63946', flexShrink: 0 },
  note: { marginTop: 16, background: '#fff', borderRadius: 12, padding: 14 },
  noteText: { margin: 0, fontSize: 12, color: '#999', textAlign: 'center' },
};
