import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import ProgressBar from '../components/ProgressBar';
import BottomNav from '../components/BottomNav';
import { hiragana } from '../data/hiragana';
import { katakana } from '../data/katakana';
import { vocabulary } from '../data/vocabulary';

export const APP_VERSION = '1.7';

export default function HomeScreen() {
  const { currentUser, currentUserData } = useApp();
  const navigate = useNavigate();

  if (!currentUser) { navigate('/'); return null; }

  const hiraganaKnown = currentUserData?.hiragana?.known?.length || 0;
  const katakanaKnown = currentUserData?.katakana?.known?.length || 0;
  const quizScores = currentUserData?.quizScores || [];
  const lastQuiz = quizScores[quizScores.length - 1];

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <p style={styles.greeting}>おはよう！</p>
            <h2 style={styles.userName}>{currentUser}</h2>
          </div>
          <div style={styles.headerRight}>
            <button onClick={() => navigate('/help')} style={styles.helpBtn} title="使用說明">❓</button>
            <button onClick={() => navigate('/')} style={styles.switchBtn}>切換帳號</button>
          </div>
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
    </div>
  );
}

function quizTypeLabel(type) {
  if (type === 'multiChoice') return '選擇題';
  if (type === 'kanaConvert') return '假名轉換';
  if (type === 'chineseToJp') return '中文→日文';
  return type;
}

const styles = {
  page: { minHeight: '100vh', background: '#f8f8f8', paddingBottom: 80 },
  container: { maxWidth: 430, margin: '0 auto', padding: '20px 16px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  greeting: { margin: 0, fontSize: 14, color: '#999' },
  userName: { margin: '4px 0 0', fontSize: 24, fontWeight: 800, color: '#222' },
  headerRight: { display: 'flex', alignItems: 'center', gap: 8 },
  helpBtn: {
    width: 34, height: 34, borderRadius: '50%', border: '1.5px solid #ddd',
    background: '#fff', fontSize: 16, cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center', padding: 0,
  },
  switchBtn: {
    padding: '8px 14px', borderRadius: 20, border: '1.5px solid #e63946',
    background: '#fff', color: '#e63946', fontSize: 13, cursor: 'pointer',
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
};
