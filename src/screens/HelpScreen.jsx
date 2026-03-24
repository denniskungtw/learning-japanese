import { useNavigate } from 'react-router-dom';
import { APP_VERSION } from './HomeScreen';

const sections = [
  {
    icon: '📊',
    title: '假名表',
    color: '#f4a261',
    items: [
      '顯示平假名、片假名完整五十音表格。',
      '點選任意字符，系統會立即朗讀該假名的日文發音。',
      '切換頁籤可在平假名與片假名之間切換。',
    ],
  },
  {
    icon: '📇',
    title: '學習卡',
    color: '#e63946',
    items: [
      '卡片正面顯示假名，背面顯示對應單字（中文意思）。',
      '點擊卡片翻面；點擊 🔊 按鈕可單獨聆聽發音。',
      '卡片下方顯示漢字字源與聯想記憶法，幫助快速記憶。',
      '還同時顯示對應的平假名（或片假名），對照學習。',
      '翻至背面後，選「✓ 已學會」或「✗ 還在學」標記進度。',
      '已標記學會的卡片不再出現；測驗答錯會自動改回「還在學」。',
    ],
  },
  {
    icon: '✏️',
    title: '測驗',
    color: '#457b9d',
    items: [
      '共三種題型，可單獨選擇練習：',
      '①【選擇題】看假名選拼音，4 選 1，答完才播放發音。',
      '②【假名轉換】看平假名輸入片假名（或反之）。',
      '③【中文→日文】看中文意思輸入日文假名，題庫涵蓋平、片假名單字及詞彙。',
      '答題後系統自動朗讀正確答案；亦可點擊 🔊 重播。',
      '答錯的假名會自動標記為「還在學」，測驗結束後列出清單。',
      '可隨時按「結束並查看結果」提前結束測驗。',
    ],
  },
  {
    icon: '🏆',
    title: '排行榜',
    color: '#2a9d8f',
    items: [
      '列出所有使用者的積分排名。',
      '積分來源：已學會假名數 ＋ 測驗得分加總。',
      '每次測驗答對一題得 1 分。',
    ],
  },
  {
    icon: '👤',
    title: '使用者管理',
    color: '#6c757d',
    items: [
      '最多支援 10 個使用者，各自擁有獨立進度。',
      '資料儲存於瀏覽器本機（LocalStorage），關閉後不消失。',
      '點選首頁右上角「切換帳號」可切換或新增使用者。',
    ],
  },
];

export default function HelpScreen() {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Top bar */}
        <div style={styles.topBar}>
          <button onClick={() => navigate('/home')} style={styles.backBtn}>← 返回</button>
          <h2 style={styles.title}>使用說明</h2>
          <span style={{ width: 48 }} />
        </div>

        {/* Intro */}
        <div style={styles.introBox}>
          <p style={styles.introText}>
            🇯🇵 學日語 App 幫助你系統學習平假名與片假名，透過聯想記憶法快速建立字符印象，再透過測驗鞏固記憶。
          </p>
        </div>

        {/* Section blocks */}
        {sections.map(sec => (
          <div key={sec.title} style={{ ...styles.sectionCard, borderLeftColor: sec.color }}>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionIcon}>{sec.icon}</span>
              <span style={{ ...styles.sectionTitle, color: sec.color }}>{sec.title}</span>
            </div>
            <ul style={styles.list}>
              {sec.items.map((item, i) => (
                <li key={i} style={styles.listItem}>{item}</li>
              ))}
            </ul>
          </div>
        ))}

        {/* Tips */}
        <div style={styles.tipsBox}>
          <p style={styles.tipsTitle}>💡 學習小技巧</p>
          <ul style={styles.list}>
            <li style={styles.listItem}>建議先看假名表熟悉整體架構，再用學習卡逐張練習。</li>
            <li style={styles.listItem}>每天練習 10–15 分鐘，連續學習效果最佳。</li>
            <li style={styles.listItem}>利用漢字字源聯想（如「安→あ」），比死背更容易記住。</li>
            <li style={styles.listItem}>選擇題適合初學，熟悉後挑戰假名轉換題型。</li>
          </ul>
        </div>

        {/* Version */}
        <div style={styles.versionBlock}>
          <p style={styles.versionText}>Version {APP_VERSION}</p>
          <p style={styles.authorText}>@Author：Dennis Kung　by Claude Code</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f8f8f8', paddingBottom: 40 },
  container: { maxWidth: 430, margin: '0 auto', padding: '16px 16px 32px' },
  topBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16,
  },
  backBtn: {
    background: 'none', border: 'none', fontSize: 15, color: '#e63946',
    cursor: 'pointer', padding: 0, minWidth: 48,
  },
  title: { fontSize: 20, fontWeight: 800, margin: 0, color: '#222' },
  introBox: {
    background: '#fff', borderRadius: 12, padding: '14px 16px',
    marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  introText: { margin: 0, fontSize: 14, color: '#555', lineHeight: 1.7 },
  sectionCard: {
    background: '#fff', borderRadius: 12, padding: '14px 16px',
    marginBottom: 12, borderLeft: '4px solid #ddd',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 },
  sectionIcon: { fontSize: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 800 },
  list: { margin: 0, paddingLeft: 18 },
  listItem: { fontSize: 13, color: '#444', lineHeight: 1.8, marginBottom: 2 },
  tipsBox: {
    background: '#f0fff8', borderRadius: 12, padding: '14px 16px',
    marginBottom: 24, border: '1.5px solid #b7e4c7',
  },
  tipsTitle: { margin: '0 0 8px', fontSize: 14, fontWeight: 700, color: '#2a9d8f' },
  versionBlock: { textAlign: 'center', paddingTop: 8 },
  versionText: { margin: '0 0 4px', fontSize: 12, color: '#bbb' },
  authorText: { margin: 0, fontSize: 12, color: '#bbb' },
};
