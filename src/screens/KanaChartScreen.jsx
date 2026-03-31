import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { speakSync } from '../utils/speech';
import { hiragana } from '../data/hiragana';
import { katakana } from '../data/katakana';
import { mnemonics } from '../data/mnemonics';

// Standard gojuuon table rows (a-i-u-e-o order)
const HIRAGANA_TABLE = [
  ['あ','い','う','え','お'],
  ['か','き','く','け','こ'],
  ['さ','し','す','せ','そ'],
  ['た','ち','つ','て','と'],
  ['な','に','ぬ','ね','の'],
  ['は','ひ','ふ','へ','ほ'],
  ['ま','み','む','め','も'],
  ['や', null,'ゆ', null,'よ'],
  ['ら','り','る','れ','ろ'],
  ['わ', null, null, null,'を'],
  ['ん', null, null, null, null],
];

const KATAKANA_TABLE = [
  ['ア','イ','ウ','エ','オ'],
  ['カ','キ','ク','ケ','コ'],
  ['サ','シ','ス','セ','ソ'],
  ['タ','チ','ツ','テ','ト'],
  ['ナ','ニ','ヌ','ネ','ノ'],
  ['ハ','ヒ','フ','ヘ','ホ'],
  ['マ','ミ','ム','メ','モ'],
  ['ヤ', null,'ユ', null,'ヨ'],
  ['ラ','リ','ル','レ','ロ'],
  ['ワ', null, null, null,'ヲ'],
  ['ン', null, null, null, null],
];

const ROMAJI_TABLE = [
  ['a','i','u','e','o'],
  ['ka','ki','ku','ke','ko'],
  ['sa','shi','su','se','so'],
  ['ta','chi','tsu','te','to'],
  ['na','ni','nu','ne','no'],
  ['ha','hi','fu','he','ho'],
  ['ma','mi','mu','me','mo'],
  ['ya',null,'yu',null,'yo'],
  ['ra','ri','ru','re','ro'],
  ['wa',null,null,null,'wo'],
  ['n',null,null,null,null],
];

const ROW_LABELS = ['あ行','か行','さ行','た行','な行','は行','ま行','や行','ら行','わ行','ん'];
const COL_LABELS = ['a','i','u','e','o'];

export default function KanaChartScreen() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('hiragana'); // 'hiragana' | 'katakana'
  const [highlighted, setHighlighted] = useState('');
  const [modalChar, setModalChar] = useState(null);

  const table = tab === 'hiragana' ? HIRAGANA_TABLE : KATAKANA_TABLE;
  const color = tab === 'hiragana' ? '#e63946' : '#457b9d';

  function handleCellClick(char, romaji) {
    if (!char) return;
    speakSync(char);

    const dataArr = tab === 'hiragana' ? hiragana : katakana;
    const pairArr = tab === 'hiragana' ? katakana : hiragana;
    const item = dataArr.find(x => x.char === char);
    if (!item) return;

    const idx = dataArr.indexOf(item);
    const pairItem = pairArr[idx];
    const memo = mnemonics[char];

    setModalChar({
      char: item.char,
      romaji: item.romaji,
      word: item.word,
      wordRomaji: item.wordRomaji,
      wordMeaning: item.wordMeaning,
      pairChar: pairItem?.char || null,
      mnemonic: memo?.mnemonic || null,
      kanji: memo?.kanji || null,
    });
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.topBar}>
          <button onClick={() => navigate('/home')} style={styles.backBtn}>← 返回</button>
          <h2 style={styles.title}>假名總表</h2>
          <div style={{ width: 50 }} />
        </div>

        {/* Tab switcher */}
        <div style={styles.tabs}>
          <button
            onClick={() => setTab('hiragana')}
            style={{ ...styles.tabBtn, ...(tab === 'hiragana' ? styles.tabActive : {}), ...(tab === 'hiragana' ? { borderColor: '#e63946', color: '#e63946' } : {}) }}
          >
            平假名 あ
          </button>
          <button
            onClick={() => setTab('katakana')}
            style={{ ...styles.tabBtn, ...(tab === 'katakana' ? styles.tabActive : {}), ...(tab === 'katakana' ? { borderColor: '#457b9d', color: '#457b9d' } : {}) }}
          >
            片假名 ア
          </button>
        </div>

        <p style={styles.hint}>點擊任一字符可查看詳細資訊 📖</p>

        {/* Chart */}
        <div style={styles.tableWrap}>
          {/* Column headers */}
          <div style={styles.tableRow}>
            <div style={styles.rowLabel} />
            {COL_LABELS.map(c => (
              <div key={c} style={styles.colHeader}>{c}</div>
            ))}
          </div>

          {HIRAGANA_TABLE.map((row, ri) => (
            <div key={ri} style={styles.tableRow}>
              <div style={{ ...styles.rowLabel, color }}>{ROW_LABELS[ri]}</div>
              {row.map((_, ci) => {
                const char = table[ri][ci];
                const rom = ROMAJI_TABLE[ri][ci];
                const isHighlighted = highlighted === char;
                return (
                  <div
                    key={ci}
                    onClick={() => handleCellClick(char, rom)}
                    style={{
                      ...styles.cell,
                      ...(char ? styles.cellActive : styles.cellEmpty),
                      ...(char ? { cursor: 'pointer' } : {}),
                      ...(isHighlighted ? { background: color, color: '#fff', transform: 'scale(1.12)' } : {}),
                    }}
                  >
                    {char && (
                      <>
                        <span style={{ fontSize: 22, fontWeight: 700, lineHeight: 1 }}>{char}</span>
                        <span style={{ fontSize: 10, color: isHighlighted ? 'rgba(255,255,255,0.85)' : '#999', marginTop: 2 }}>{rom}</span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div style={styles.infoBox}>
          <p style={{ margin: 0, fontSize: 13, color: '#666', lineHeight: 1.7 }}>
            💡 日文共有 <strong>46</strong> 個基本{tab === 'hiragana' ? '平假名' : '片假名'}，按五十音順序排列。<br />
            {tab === 'hiragana' ? '平假名用於日文固有詞彙及語法變化。' : '片假名主要用於外來語及擬聲詞。'}
          </p>
        </div>
        {/* Flashcard Modal */}
        {modalChar && (
          <div style={styles.modalOverlay} onClick={() => setModalChar(null)}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
              {/* Character */}
              <div style={{ fontSize: 80, fontWeight: 900, color, textAlign: 'center', lineHeight: 1 }}>
                {modalChar.char}
              </div>
              <div style={{ fontSize: 20, color: '#666', textAlign: 'center', marginTop: 4 }}>
                {modalChar.romaji}
              </div>

              {/* Speak */}
              <button onClick={() => speakSync(modalChar.char)} style={styles.modalSpeakBtn}>
                🔊 發音
              </button>

              {/* Example word */}
              <div style={styles.modalSection}>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#222' }}>{modalChar.word}</div>
                <div style={{ fontSize: 14, color: '#888' }}>{modalChar.wordRomaji}</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#444', marginTop: 4 }}>{modalChar.wordMeaning}</div>
                <button onClick={() => speakSync(modalChar.word)} style={styles.modalMiniSpeaker}>🔊</button>
              </div>

              {/* Mnemonic */}
              {modalChar.mnemonic && (
                <div style={styles.modalMnemonic}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 13, color: '#666' }}>漢字字源：</span>
                    <span style={{ fontSize: 20, fontWeight: 900, color }}>{modalChar.kanji}</span>
                  </div>
                  <p style={{ margin: '6px 0 0', fontSize: 13, color: '#444', lineHeight: 1.6 }}>💡 {modalChar.mnemonic}</p>
                </div>
              )}

              {/* Paired kana */}
              {modalChar.pairChar && (
                <div style={styles.modalPair}>
                  <span style={{ fontSize: 13, color: '#888' }}>
                    對應{tab === 'hiragana' ? '片假名' : '平假名'}：
                  </span>
                  <span
                    style={{ fontSize: 26, fontWeight: 900, color: tab === 'hiragana' ? '#457b9d' : '#e63946', cursor: 'pointer' }}
                    onClick={() => speakSync(modalChar.pairChar)}
                  >
                    {modalChar.pairChar}
                  </span>
                </div>
              )}

              {/* Close */}
              <button onClick={() => setModalChar(null)} style={styles.modalCloseBtn}>關閉</button>
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f8f8f8', paddingBottom: 80 },
  container: { maxWidth: 430, margin: '0 auto', padding: '16px 12px' },
  topBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  backBtn: { background: 'none', border: 'none', fontSize: 15, color: '#e63946', cursor: 'pointer', padding: 0 },
  title: { fontSize: 20, fontWeight: 800, margin: 0, color: '#222' },
  tabs: { display: 'flex', gap: 10, marginBottom: 10 },
  tabBtn: {
    flex: 1, padding: '10px 0', borderRadius: 12, border: '2px solid #ddd',
    background: '#fff', color: '#999', fontSize: 15, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
  },
  tabActive: { background: '#fff8f8' },
  hint: { fontSize: 13, color: '#aaa', margin: '0 0 12px', textAlign: 'center' },
  tableWrap: { background: 'transparent', borderRadius: 16, padding: '10px 8px' },
  tableRow: { display: 'flex', alignItems: 'center', marginBottom: 4 },
  rowLabel: { width: 36, fontSize: 10, color: '#999', textAlign: 'center', fontWeight: 600, flexShrink: 0 },
  colHeader: { flex: 1, textAlign: 'center', fontSize: 11, color: '#aaa', fontWeight: 700, padding: '2px 0' },
  cell: {
    flex: 1, aspectRatio: '1', borderRadius: 8, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', margin: '2px', transition: 'all 0.15s',
    minHeight: 44,
  },
  cellActive: { background: '#fff', border: '1px solid #e8e8e8', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  cellEmpty: { background: 'transparent', border: 'none', pointerEvents: 'none' },
  infoBox: { background: '#fff', borderRadius: 12, padding: '14px 16px', marginTop: 12 },
  modalOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 999, padding: 20,
  },
  modal: {
    background: '#fff', borderRadius: 20, padding: '28px 24px',
    width: '100%', maxWidth: 340, boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
    maxHeight: '85vh', overflowY: 'auto',
  },
  modalSpeakBtn: {
    display: 'block', margin: '12px auto', padding: '8px 24px',
    borderRadius: 20, border: '1.5px solid #ddd', background: '#f8f8f8',
    fontSize: 16, cursor: 'pointer',
  },
  modalSection: {
    background: '#f8f8f8', borderRadius: 12, padding: '14px 16px',
    textAlign: 'center', marginTop: 12, position: 'relative',
  },
  modalMiniSpeaker: {
    position: 'absolute', top: 10, right: 10,
    background: '#eee', border: 'none', borderRadius: 16,
    fontSize: 14, cursor: 'pointer', padding: '2px 6px',
  },
  modalMnemonic: {
    background: '#fffbf0', border: '1.5px solid #f4d58d',
    borderRadius: 12, padding: '12px 14px', marginTop: 12,
  },
  modalPair: {
    display: 'flex', alignItems: 'center', gap: 8,
    marginTop: 12, justifyContent: 'center',
  },
  modalCloseBtn: {
    width: '100%', marginTop: 16, padding: '12px 0', borderRadius: 12,
    border: '1.5px solid #ccc', background: '#fff', color: '#666',
    fontSize: 15, fontWeight: 600, cursor: 'pointer',
  },
};
