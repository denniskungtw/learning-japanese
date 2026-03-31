import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { hiragana } from '../data/hiragana';
import { katakana } from '../data/katakana';
import BottomNav from '../components/BottomNav';

const quizTypes = [
  {
    key: 'multiChoice',
    icon: '🔤',
    title: '發音測驗',
    desc: '看到字符，從四個選項中選出正確的羅馬拼音',
    color: '#e63946',
    supportsFilter: true,
  },
  {
    key: 'kanaConvert',
    icon: '🔄',
    title: '假名轉換',
    desc: '看片假名，用手機日文鍵盤輸入對應的平假名（或反之）',
    color: '#457b9d',
    supportsFilter: true,
  },
  {
    key: 'chineseToJp',
    icon: '🈶',
    title: '單字測驗',
    desc: '看中文意思，從四個選項中選出正確的日文寫法',
    color: '#2a9d8f',
    supportsFilter: false,
  },
];

const filterOptions = [
  { key: 'all', label: '全部' },
  { key: 'known', label: '已學過' },
  { key: 'unknown', label: '還在學' },
];

export default function QuizScreen() {
  const { displayName, store } = useApp();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  if (!displayName) { navigate('/'); return null; }

  const hKnown = store?.hiragana?.known || [];
  const kKnown = store?.katakana?.known || [];
  const knownCount = hKnown.length + kKnown.length;
  const unknownCount = (hiragana.length + katakana.length) - knownCount;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.title}>測驗</h2>
        <p style={styles.subtitle}>選擇測驗類型</p>

        {/* Filter selector */}
        <div style={styles.filterBar}>
          <span style={styles.filterLabel}>出題範圍：</span>
          <div style={styles.filterBtns}>
            {filterOptions.map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                style={{
                  ...styles.filterBtn,
                  ...(filter === f.key ? styles.filterBtnActive : {}),
                }}
              >
                {f.label}
                <span style={styles.filterCount}>
                  {f.key === 'all' ? 92 : f.key === 'known' ? knownCount : unknownCount}
                </span>
              </button>
            ))}
          </div>
        </div>

        {quizTypes.map(qt => {
          const disabled = qt.supportsFilter && filter !== 'all' &&
            (filter === 'known' ? knownCount < 4 : unknownCount < 4);
          return (
            <button
              key={qt.key}
              onClick={() => !disabled && navigate(`/quiz/${qt.key}`, { state: { filter: qt.supportsFilter ? filter : 'all' } })}
              style={{
                ...styles.card,
                borderColor: disabled ? '#ccc' : qt.color,
                opacity: disabled ? 0.5 : 1,
                cursor: disabled ? 'not-allowed' : 'pointer',
              }}
            >
              <div style={styles.cardLeft}>
                <span style={styles.icon}>{qt.icon}</span>
                <div>
                  <div style={{ ...styles.cardTitle, color: disabled ? '#999' : qt.color }}>{qt.title}</div>
                  <div style={styles.cardDesc}>
                    {disabled ? '需要至少 4 個字符才能出題' : qt.desc}
                  </div>
                </div>
              </div>
              <span style={{ color: disabled ? '#ccc' : qt.color, fontSize: 20 }}>›</span>
            </button>
          );
        })}

        <div style={styles.tipBox}>
          <p style={styles.tipText}>
            💡 <strong>假名轉換</strong>需要切換到日文輸入法。
            在手機上可使用日文手寫輸入。
          </p>
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
  filterBar: {
    background: '#fff', borderRadius: 12, padding: '12px 14px',
    marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  },
  filterLabel: { fontSize: 13, color: '#666', fontWeight: 600 },
  filterBtns: { display: 'flex', gap: 8, marginTop: 8 },
  filterBtn: {
    flex: 1, padding: '8px 0', borderRadius: 10,
    border: '1.5px solid #ddd', background: '#f8f8f8',
    fontSize: 14, fontWeight: 600, color: '#666', cursor: 'pointer',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
  },
  filterBtnActive: {
    background: '#e63946', color: '#fff', borderColor: '#e63946',
  },
  filterCount: { fontSize: 11, fontWeight: 400, opacity: 0.8 },
  card: {
    width: '100%', background: '#fff', borderRadius: 16, padding: '18px 16px',
    border: '2px solid', boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 14, cursor: 'pointer', boxSizing: 'border-box', textAlign: 'left',
  },
  cardLeft: { display: 'flex', alignItems: 'center', gap: 14, flex: 1 },
  icon: { fontSize: 32 },
  cardTitle: { fontSize: 17, fontWeight: 700, marginBottom: 4 },
  cardDesc: { fontSize: 13, color: '#666', lineHeight: 1.5 },
  tipBox: { background: '#fff', borderRadius: 12, padding: 14, marginTop: 4 },
  tipText: { margin: 0, fontSize: 13, color: '#666', lineHeight: 1.7 },
};
