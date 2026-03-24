import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import BottomNav from '../components/BottomNav';

const quizTypes = [
  {
    key: 'multiChoice',
    icon: '🔤',
    title: '選擇題',
    desc: '看到字符，從四個選項中選出正確的羅馬拼音',
    color: '#e63946',
  },
  {
    key: 'kanaConvert',
    icon: '🔄',
    title: '假名轉換',
    desc: '看片假名，用手機日文鍵盤輸入對應的平假名（或反之）',
    color: '#457b9d',
  },
  {
    key: 'chineseToJp',
    icon: '🈶',
    title: '中文 → 日文',
    desc: '看中文字，輸入它的日文平假名寫法',
    color: '#2a9d8f',
  },
];

export default function QuizScreen() {
  const { currentUser } = useApp();
  const navigate = useNavigate();

  if (!currentUser) { navigate('/'); return null; }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.title}>測驗</h2>
        <p style={styles.subtitle}>選擇測驗類型</p>

        {quizTypes.map(qt => (
          <button
            key={qt.key}
            onClick={() => navigate(`/quiz/${qt.key}`)}
            style={{ ...styles.card, borderColor: qt.color }}
          >
            <div style={styles.cardLeft}>
              <span style={styles.icon}>{qt.icon}</span>
              <div>
                <div style={{ ...styles.cardTitle, color: qt.color }}>{qt.title}</div>
                <div style={styles.cardDesc}>{qt.desc}</div>
              </div>
            </div>
            <span style={{ color: qt.color, fontSize: 20 }}>›</span>
          </button>
        ))}

        <div style={styles.tipBox}>
          <p style={styles.tipText}>
            💡 <strong>假名轉換</strong>和<strong>中文→日文</strong>需要切換到日文輸入法。
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
