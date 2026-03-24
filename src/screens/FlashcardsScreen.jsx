import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import BottomNav from '../components/BottomNav';
import ProgressBar from '../components/ProgressBar';
import { hiragana } from '../data/hiragana';
import { katakana } from '../data/katakana';

export default function FlashcardsScreen() {
  const { currentUser, currentUserData } = useApp();
  const navigate = useNavigate();

  if (!currentUser) { navigate('/'); return null; }

  const hiraganaKnown = currentUserData?.hiragana?.known?.length || 0;
  const katakanaKnown = currentUserData?.katakana?.known?.length || 0;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.title}>學習卡</h2>
        <p style={styles.subtitle}>選擇一個字母表開始練習</p>

        <button onClick={() => navigate('/flashcards/hiragana')} style={styles.deckCard}>
          <div style={styles.deckLeft}>
            <span style={styles.deckChar}>あ</span>
            <div>
              <div style={styles.deckName}>平假名</div>
              <div style={styles.deckCount}>46 個字符</div>
            </div>
          </div>
          <div style={{ width: 120 }}>
            <ProgressBar value={hiraganaKnown} max={hiragana.length} color="#e63946" />
          </div>
        </button>

        <button onClick={() => navigate('/flashcards/katakana')} style={{ ...styles.deckCard, borderColor: '#457b9d' }}>
          <div style={styles.deckLeft}>
            <span style={{ ...styles.deckChar, color: '#457b9d' }}>ア</span>
            <div>
              <div style={styles.deckName}>片假名</div>
              <div style={styles.deckCount}>46 個字符</div>
            </div>
          </div>
          <div style={{ width: 120 }}>
            <ProgressBar value={katakanaKnown} max={katakana.length} color="#457b9d" />
          </div>
        </button>

        <div style={styles.tipBox}>
          <p style={styles.tipText}>💡 點擊卡片翻面查看單字，然後標記是否已學會。</p>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f8f8f8', paddingBottom: 80 },
  container: { maxWidth: 430, margin: '0 auto', padding: '20px 16px' },
  title: { fontSize: 24, fontWeight: 800, margin: '0 0 4px', color: '#222' },
  subtitle: { fontSize: 14, color: '#999', margin: '0 0 24px' },
  deckCard: {
    width: '100%', background: '#fff', borderRadius: 16, padding: '18px 16px',
    border: '2px solid #e63946', boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 16, cursor: 'pointer', boxSizing: 'border-box',
  },
  deckLeft: { display: 'flex', alignItems: 'center', gap: 14 },
  deckChar: { fontSize: 40, fontWeight: 700, color: '#e63946' },
  deckName: { fontSize: 18, fontWeight: 700, color: '#222', textAlign: 'left' },
  deckCount: { fontSize: 13, color: '#999', textAlign: 'left' },
  tipBox: { background: '#fff', borderRadius: 12, padding: 14, marginTop: 8 },
  tipText: { margin: 0, fontSize: 14, color: '#666', lineHeight: 1.6 },
};
