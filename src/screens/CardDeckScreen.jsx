import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import FlipCard from '../components/FlipCard';
import ProgressBar from '../components/ProgressBar';
import { hiragana } from '../data/hiragana';
import { katakana } from '../data/katakana';
import { mnemonics } from '../data/mnemonics';

export default function CardDeckScreen() {
  const { deck } = useParams(); // 'hiragana' or 'katakana'
  const navigate = useNavigate();
  const { currentUser, currentUserData, markKnown, markUnknown } = useApp();
  const [index, setIndex] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [mode, setMode] = useState('unlearned'); // 'unlearned' | 'all'

  if (!currentUser) { navigate('/'); return null; }

  const data = deck === 'hiragana' ? hiragana : katakana;
  const pairData = deck === 'hiragana' ? katakana : hiragana; // opposite deck for pairing
  const deckName = deck === 'hiragana' ? '平假名' : '片假名';
  const pairName = deck === 'hiragana' ? '片假名' : '平假名';
  const pairColor = deck === 'hiragana' ? '#457b9d' : '#e63946';
  const deckColor = deck === 'hiragana' ? '#e63946' : '#457b9d';
  const known = currentUserData?.[deck]?.known || [];

  // Only show cards NOT yet learned (or all cards in review mode)
  const cards = mode === 'unlearned'
    ? data.filter(c => !known.includes(c.char))
    : data;

  // ---- All cards already learned ----
  if (cards.length === 0 && mode === 'unlearned') {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.summaryBox}>
            <div style={{ fontSize: 60 }}>🏆</div>
            <h2 style={styles.summaryTitle}>全部學會了！</h2>
            <p style={styles.summaryText}>
              {deckName} {data.length} 個字符全部完成！
            </p>
            <ProgressBar value={known.length} max={data.length} color={deckColor} />
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button
                onClick={() => { setMode('all'); setIndex(0); setShowSummary(false); }}
                style={{ ...styles.btn, background: deckColor }}
              >複習全部</button>
              <button onClick={() => navigate('/flashcards')} style={{ ...styles.btn, background: '#555' }}>返回</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const safeIndex = Math.min(index, cards.length - 1);
  const card = cards[safeIndex];

  function handleKnow() {
    markKnown(deck, card.char);
    if (mode === 'unlearned') {
      // Card will be removed from filtered list; next card fills this index
      if (cards.length <= 1) setShowSummary(true);
      // else: don't increment — removal shifts next card into current position
    } else {
      // Review mode: card stays in list, advance normally
      if (safeIndex < cards.length - 1) setIndex(i => i + 1);
      else setShowSummary(true);
    }
  }

  function handleDontKnow() {
    markUnknown(deck, card.char);
    if (safeIndex < cards.length - 1) setIndex(i => i + 1);
    else setShowSummary(true);
  }

  function restart() {
    setIndex(0);
    setShowSummary(false);
    setMode('unlearned');
  }

  if (showSummary) {
    const latestKnown = currentUserData?.[deck]?.known || [];
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.summaryBox}>
            <div style={{ fontSize: 60 }}>🎉</div>
            <h2 style={styles.summaryTitle}>練習完成！</h2>
            <p style={styles.summaryText}>
              {deckName}：已學會 <strong>{latestKnown.length}</strong> / {data.length} 個字符
            </p>
            <ProgressBar value={latestKnown.length} max={data.length} color={deckColor} />
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={restart} style={{ ...styles.btn, background: deckColor }}>再練一次</button>
              <button onClick={() => navigate('/flashcards')} style={{ ...styles.btn, background: '#555' }}>返回</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Top bar */}
        <div style={styles.topBar}>
          <button onClick={() => navigate('/flashcards')} style={styles.backBtn}>← 返回</button>
          <span style={{ fontSize: 15, color: '#444', fontWeight: 600 }}>{deckName}</span>
          <span style={{ fontSize: 14, color: '#999' }}>{safeIndex + 1} / {cards.length}</span>
        </div>

        {/* Status bar */}
        <div style={styles.modeBar}>
          {mode === 'unlearned' ? (
            <span style={{ fontSize: 13, color: deckColor }}>
              📚 待學：{cards.length} 張 ／ 已學會：{known.length} 張
            </span>
          ) : (
            <span style={{ fontSize: 13, color: '#888' }}>複習模式：全部 {data.length} 張</span>
          )}
        </div>

        <ProgressBar value={safeIndex} max={cards.length} color={deckColor} />

        <div style={{ marginTop: 20 }}>
          <FlipCard
            key={card.char}
            frontText={card.char}
            backText={card.word}
            front={
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 88, fontWeight: 700, color: deckColor, lineHeight: 1 }}>{card.char}</div>
                <div style={{ fontSize: 20, color: '#666', marginTop: 8 }}>{card.romaji}</div>
              </div>
            }
            back={
              <div style={{ textAlign: 'center', padding: '0 24px' }}>
                <div style={{ fontSize: 52, fontWeight: 700, color: deckColor, marginBottom: 6 }}>{card.word}</div>
                <div style={{ fontSize: 17, color: '#777' }}>{card.wordRomaji}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#222', marginTop: 6 }}>{card.wordMeaning}</div>
              </div>
            }
            onKnow={handleKnow}
            onDontKnow={handleDontKnow}
          />
        </div>

        {/* Mnemonic box */}
        {mnemonics[card.char] && (() => {
          const cardIdx = data.findIndex(c => c.char === card.char);
          const pairChar = pairData[cardIdx]?.char;
          return (
            <div style={styles.mnemonicBox}>
              <div style={styles.mnemonicHeader}>
                <span style={styles.kanjiOrigin}>
                  漢字字源：
                  <span style={{ ...styles.kanjiChar, color: deckColor }}>
                    {mnemonics[card.char].kanji}
                  </span>
                </span>
                <span style={styles.mnemonicLabel}>聯想記憶</span>
              </div>
              <p style={styles.mnemonicText}>💡 {mnemonics[card.char].mnemonic}</p>
              {pairChar && (
                <div style={styles.pairRow}>
                  <span style={styles.pairLabel}>對應{pairName}：</span>
                  <span style={{ ...styles.pairChar, color: pairColor }}>{pairChar}</span>
                  <span style={styles.pairRomaji}>（{pairData[cardIdx].romaji}）</span>
                </div>
              )}
            </div>
          );
        })()}

        {/* Known badge */}
        {known.includes(card.char) && (
          <div style={styles.knownBadge}>✓ 已標記為學會</div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f8f8f8' },
  container: { maxWidth: 430, margin: '0 auto', padding: '16px 16px 40px' },
  topBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  backBtn: { background: 'none', border: 'none', fontSize: 15, color: '#e63946', cursor: 'pointer', padding: 0 },
  modeBar: { marginBottom: 10, paddingLeft: 2 },
  knownBadge: {
    textAlign: 'center', padding: '8px 20px', background: '#d4edda',
    borderRadius: 20, fontSize: 14, color: '#2a9d8f',
    width: 'fit-content', margin: '16px auto 0', display: 'block',
  },
  summaryBox: {
    background: '#fff', borderRadius: 20, padding: 32, textAlign: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)', marginTop: 40,
  },
  summaryTitle: { fontSize: 26, fontWeight: 800, margin: '8px 0' },
  summaryText: { fontSize: 16, color: '#555', margin: '0 0 16px' },
  btn: { flex: 1, padding: '14px 0', borderRadius: 12, border: 'none', color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer' },
  mnemonicBox: {
    background: '#fffbf0', border: '1.5px solid #f4d58d',
    borderRadius: 14, padding: '14px 16px', marginTop: 16,
  },
  mnemonicHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8,
  },
  kanjiOrigin: { fontSize: 14, color: '#666', fontWeight: 600 },
  kanjiChar: { fontSize: 22, fontWeight: 900, marginLeft: 6 },
  mnemonicLabel: {
    fontSize: 11, color: '#f4a261', fontWeight: 700,
    background: '#fff3e0', borderRadius: 8, padding: '2px 8px',
  },
  mnemonicText: {
    margin: '0 0 10px', fontSize: 14, color: '#444', lineHeight: 1.7,
  },
  pairRow: {
    display: 'flex', alignItems: 'center', gap: 4,
    borderTop: '1px solid #f0e0b0', paddingTop: 8, marginTop: 2,
  },
  pairLabel: { fontSize: 12, color: '#888' },
  pairChar: { fontSize: 22, fontWeight: 900 },
  pairRomaji: { fontSize: 13, color: '#aaa', marginLeft: 2 },
};
