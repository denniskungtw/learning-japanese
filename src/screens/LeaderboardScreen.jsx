import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { hiragana } from '../data/hiragana';
import { katakana } from '../data/katakana';

export default function LeaderboardScreen() {
  const { store, currentUser, getTotalScore } = useApp();
  const navigate = useNavigate();

  if (!currentUser) { navigate('/'); return null; }

  const ranked = [...store.users]
    .map(name => ({
      name,
      total: getTotalScore(name),
      hiragana: store.userData[name]?.hiragana?.known?.length || 0,
      katakana: store.userData[name]?.katakana?.known?.length || 0,
      quizCount: store.userData[name]?.quizScores?.length || 0,
    }))
    .sort((a, b) => b.total - a.total);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.title}>排行榜</h2>
        <p style={styles.subtitle}>所有使用者的學習成績</p>

        {ranked.length === 0 ? (
          <div style={styles.emptyBox}>
            <p>目前沒有使用者資料</p>
          </div>
        ) : (
          <>
            {/* Top 3 podium */}
            {ranked.length >= 3 && (
              <div style={styles.podium}>
                {[ranked[1], ranked[0], ranked[2]].map((u, podiumIdx) => {
                  const actualRank = podiumIdx === 1 ? 0 : podiumIdx === 0 ? 1 : 2;
                  const heights = [80, 110, 60];
                  return (
                    <div key={u.name} style={{ ...styles.podiumItem, height: heights[podiumIdx] }}>
                      <div style={styles.podiumMedal}>{medals[actualRank]}</div>
                      <div style={styles.podiumName}>{u.name}</div>
                      <div style={styles.podiumScore}>{u.total}</div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Full list */}
            <div style={styles.list}>
              {ranked.map((u, i) => (
                <div
                  key={u.name}
                  style={{
                    ...styles.row,
                    background: u.name === currentUser ? '#fff7f7' : '#fff',
                    borderColor: u.name === currentUser ? '#e63946' : '#eee',
                  }}
                >
                  <span style={styles.rank}>{medals[i] || `${i + 1}`}</span>
                  <div style={styles.rowMain}>
                    <div style={styles.rowName}>
                      {u.name}
                      {u.name === currentUser && <span style={styles.youBadge}>我</span>}
                    </div>
                    <div style={styles.rowDetails}>
                      あ {u.hiragana}/{hiragana.length} &nbsp;·&nbsp;
                      ア {u.katakana}/{katakana.length} &nbsp;·&nbsp;
                      測驗 {u.quizCount} 次
                    </div>
                  </div>
                  <div style={styles.totalScore}>{u.total}</div>
                </div>
              ))}
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
