import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { hiragana } from '../data/hiragana';
import { katakana } from '../data/katakana';
import { vocabulary } from '../data/vocabulary';
import { confusables } from '../data/confusables';
import { speak, speakSync, speakDelayed } from '../utils/speech';

const QUIZ_LENGTH = 10;

// Katakana ↔ visually identical Kanji mapping for handwriting IME tolerance
const LOOKALIKE_MAP = {
  '工': 'エ', '力': 'カ', '夕': 'タ', '二': 'ニ',
  '口': 'ロ', '八': 'ハ', '卜': 'ト', '厶': 'ム',
  '千': 'チ', '十': 'ナ', '匕': 'ヒ', '丁': 'テ',
  '乃': 'ノ', '也': 'ヤ', '之': 'ノ', '人': 'ヘ',
  '个': 'ケ', '弋': 'ヌ', '巾': 'リ', '丸': 'マ',
  // Hiragana lookalikes
  '巳': 'し', '己': 'こ', '女': 'め',
};

// Small kana → regular kana
const SMALL_KANA_MAP = {
  'ぁ': 'あ', 'ぃ': 'い', 'ぅ': 'う', 'ぇ': 'え', 'ぉ': 'お',
  'っ': 'つ', 'ゃ': 'や', 'ゅ': 'ゆ', 'ょ': 'よ', 'ゎ': 'わ',
  'ァ': 'ア', 'ィ': 'イ', 'ゥ': 'ウ', 'ェ': 'エ', 'ォ': 'オ',
  'ッ': 'ツ', 'ャ': 'ヤ', 'ュ': 'ユ', 'ョ': 'ヨ', 'ヮ': 'ワ',
};

function normalizeKana(str) {
  return str.trim().split('').map(c => {
    // 1. Kanji lookalikes → katakana
    if (LOOKALIKE_MAP[c]) c = LOOKALIKE_MAP[c];
    // 2. Small kana → regular kana
    if (SMALL_KANA_MAP[c]) c = SMALL_KANA_MAP[c];
    // 3. Katakana → hiragana (U+30A1-U+30F6 → U+3041-U+3096)
    const code = c.charCodeAt(0);
    if (code >= 0x30A1 && code <= 0x30F6) {
      return String.fromCharCode(code - 0x60);
    }
    // 4. Half-width katakana → full-width then to hiragana
    if (code >= 0xFF66 && code <= 0xFF9D) {
      const hwMap = 'ヲァィゥェォャュョッーアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユラリルレロワン';
      const fw = hwMap[code - 0xFF66];
      if (fw) {
        const fwCode = fw.charCodeAt(0);
        if (fwCode >= 0x30A1 && fwCode <= 0x30F6) {
          return String.fromCharCode(fwCode - 0x60);
        }
        return fw;
      }
    }
    return c;
  }).join('');
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function filterPool(hKnown, kKnown, filter) {
  if (filter === 'known') {
    return {
      h: hiragana.filter(x => hKnown.includes(x.char)),
      k: katakana.filter(x => kKnown.includes(x.char)),
    };
  }
  if (filter === 'unknown') {
    return {
      h: hiragana.filter(x => !hKnown.includes(x.char)),
      k: katakana.filter(x => !kKnown.includes(x.char)),
    };
  }
  return { h: [...hiragana], k: [...katakana] };
}

function buildMultiChoice(hKnown, kKnown, filter) {
  const { h, k } = filterPool(hKnown, kKnown, filter);
  const pool = shuffle([...h, ...k]).slice(0, QUIZ_LENGTH);
  return pool.map(item => {
    // De-duplicate distractors by romaji — draw from ALL kana for variety
    const seenRomaji = new Set([item.romaji]);
    const distractors = [];
    for (const x of shuffle([...hiragana, ...katakana])) {
      if (!seenRomaji.has(x.romaji)) {
        seenRomaji.add(x.romaji);
        distractors.push(x);
        if (distractors.length === 3) break;
      }
    }
    const options = shuffle([item, ...distractors]);
    const deck = hiragana.find(hh => hh.char === item.char) ? 'hiragana' : 'katakana';
    return {
      type: 'mc',
      question: item.char,
      correct: item.romaji,
      options: options.map(o => o.romaji),
      speakText: item.char,
      deck,
    };
  });
}

function buildKanaConvert(hKnown, kKnown, filter) {
  const { h, k } = filterPool(hKnown, kKnown, filter);
  // Build pairs only from filtered kana that exist in both sets
  const hChars = new Set(h.map(x => x.romaji));
  const kChars = new Set(k.map(x => x.romaji));
  const pairs = hiragana.map((hh, i) => ({ h: hh.char, k: katakana[i].char, romaji: hh.romaji }))
    .filter(p => {
      if (filter === 'all') return true;
      // Include pair if either side matches the filter
      return hChars.has(p.romaji) || kChars.has(p.romaji);
    });
  const picked = shuffle(pairs).slice(0, QUIZ_LENGTH);
  return picked.map(p => {
    const dir = Math.random() > 0.5;
    return {
      type: 'input',
      question: dir ? p.k : p.h,
      questionLabel: dir ? '片假名' : '平假名',
      answerLabel: dir ? '平假名' : '片假名',
      correct: dir ? p.h : p.k,
      speakText: dir ? p.k : p.h,
      speakAnswer: dir ? p.h : p.k,
      deck: dir ? 'katakana' : 'hiragana',
    };
  });
}

function isKatakanaWord(str) {
  return /[\u30A0-\u30FF]/.test(str);
}

function buildVocabMC() {
  // Combine: hiragana words + katakana words + vocabulary list
  const hWords = hiragana.map(h => ({
    chinese: h.wordMeaning,
    japanese: h.word,
    romaji: h.wordRomaji,
  }));
  const kWords = katakana.map(k => ({
    chinese: k.wordMeaning,
    japanese: k.word,
    romaji: k.wordRomaji,
  }));
  const vWords = vocabulary.map(v => ({
    chinese: v.chinese,
    japanese: v.japanese,
    romaji: v.romaji,
  }));

  const all = shuffle([...hWords, ...kWords, ...vWords]);
  // Deduplicate by japanese answer
  const seen = new Set();
  const unique = all.filter(w => {
    if (seen.has(w.japanese)) return false;
    seen.add(w.japanese);
    return true;
  });

  const picked = unique.slice(0, QUIZ_LENGTH);

  return picked.map(v => {
    const dir = Math.random() > 0.5;

    if (dir) {
      // A: 中文→日文 — distractors must be same script (hiragana or katakana)
      const isKata = isKatakanaWord(v.japanese);
      const sameScript = unique.filter(w => w.japanese !== v.japanese && isKatakanaWord(w.japanese) === isKata);
      const seenJp = new Set([v.japanese]);
      const distractors = [];
      for (const w of shuffle(sameScript)) {
        if (!seenJp.has(w.japanese)) {
          seenJp.add(w.japanese);
          distractors.push(w);
          if (distractors.length === 3) break;
        }
      }
      // Fallback: if not enough same-script, fill from any
      if (distractors.length < 3) {
        for (const w of shuffle(unique)) {
          if (!seenJp.has(w.japanese)) {
            seenJp.add(w.japanese);
            distractors.push(w);
            if (distractors.length === 3) break;
          }
        }
      }
      const options = shuffle([v, ...distractors]);
      return {
        type: 'mc',
        question: v.chinese,
        questionLabel: '中文',
        correct: v.japanese,
        options: options.map(o => o.japanese),
        romaji: v.romaji,
        speakText: null,
        speakAnswer: v.japanese,
      };
    } else {
      // B: 日文→中文
      const seenCn = new Set([v.chinese]);
      const distractors = [];
      for (const w of shuffle(unique)) {
        if (!seenCn.has(w.chinese)) {
          seenCn.add(w.chinese);
          distractors.push(w);
          if (distractors.length === 3) break;
        }
      }
      const options = shuffle([v, ...distractors]);
      return {
        type: 'mc',
        question: v.japanese,
        questionLabel: '日文',
        correct: v.chinese,
        options: options.map(o => o.chinese),
        romaji: v.romaji,
        speakText: v.japanese,
        speakAnswer: v.japanese,
      };
    }
  });
}

function buildConfusable() {
  // Flatten all confusable groups into individual items with group reference
  const allItems = [];
  for (const { group } of confusables) {
    for (const item of group) {
      allItems.push({ item, group });
    }
  }
  const picked = shuffle(allItems).slice(0, QUIZ_LENGTH);

  return picked.map(({ item, group }) => {
    const dir = Math.random() > 0.5;

    if (dir) {
      // A: show character, pick romaji — do NOT speak before answering (would give it away)
      const options = shuffle(group.map(g => g.romaji));
      return {
        type: 'mc',
        question: item.char,
        questionLabel: '這是哪一個？',
        correct: item.romaji,
        options,
        speakText: null,
        speakAnswer: item.char,
        deck: item.deck,
      };
    } else {
      // B: show romaji, pick character
      const options = shuffle(group.map(g => g.char));
      return {
        type: 'mc',
        question: item.romaji,
        questionLabel: '哪一個是…',
        correct: item.char,
        options,
        speakText: null,
        speakAnswer: item.char,
        deck: item.deck,
      };
    }
  });
}

export default function QuizPlayScreen() {
  const { quizType } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { saveQuizScore, markUnknown, store } = useApp();

  const filter = location.state?.filter || 'all';
  const hKnown = store?.hiragana?.known || [];
  const kKnown = store?.katakana?.known || [];

  const [questions] = useState(() => {
    if (quizType === 'multiChoice') return buildMultiChoice(hKnown, kKnown, filter);
    if (quizType === 'kanaConvert') return buildKanaConvert(hKnown, kKnown, filter);
    if (quizType === 'chineseToJp') return buildVocabMC();
    if (quizType === 'confusable') return buildConfusable();
    return [];
  });

  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [inputVal, setInputVal] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState([]);
  const [done, setDone] = useState(false);
  // Track kana chars marked back to "still learning" during this session
  const [markedUnknown, setMarkedUnknown] = useState([]); // [{ char, deck }]
  const scoreSaved = useRef(false);

  const q = questions[qIndex];

  // Auto-speak question ONLY for kanaConvert and chineseToJp (NOT multiChoice)
  useEffect(() => {
    if (quizType !== 'multiChoice' && quizType !== 'chineseToJp' && quizType !== 'confusable' && q?.speakText) {
      speakDelayed(q.speakText, 350);
    }
  }, [qIndex]);

  useEffect(() => {
    if (done && !scoreSaved.current) {
      scoreSaved.current = true;
      const finalScore = results.filter(r => r.ok).length;
      saveQuizScore(quizType, finalScore, QUIZ_LENGTH);
    }
  }, [done]);

  function submitMC(opt) {
    if (submitted) return;
    setSelected(opt);
    setSubmitted(true);
    const correct = opt === q.correct;
    if (correct) {
      setScore(s => s + 1);
    } else {
      if (q.deck) {
        markUnknown(q.deck, q.question);
        setMarkedUnknown(prev => [...prev, { char: q.question, deck: q.deck }]);
      }
    }
    // Speak AFTER answering — still in click handler (user gesture), use speakSync
    if (q.speakText) speakSync(q.speakText);
    else if (q.speakAnswer) speakSync(q.speakAnswer);
    setResults(r => [...r, { question: q.question, correct: q.correct, given: opt, ok: correct, speakAnswer: q.speakText || q.speakAnswer }]);
  }

  function submitInput() {
    if (submitted) return;
    const ans = inputVal.trim();
    setSubmitted(true);
    const correct = normalizeKana(ans) === normalizeKana(q.correct);
    if (correct) {
      setScore(s => s + 1);
    } else {
      if (q.deck) {
        markUnknown(q.deck, q.question);
        setMarkedUnknown(prev => [...prev, { char: q.question, deck: q.deck }]);
      }
    }
    // Still inside click/submit handler — use speakSync
    if (q.speakAnswer) speakSync(q.speakAnswer);
    setResults(r => [...r, {
      question: q.question,
      correct: q.correct,
      given: ans,
      ok: correct,
      speakAnswer: q.speakAnswer,
    }]);
  }

  function next() {
    if (qIndex < questions.length - 1) {
      setQIndex(i => i + 1);
      setSelected(null);
      setInputVal('');
      setSubmitted(false);
    } else {
      setDone(true);
    }
  }

  // Finish early (quit mid-quiz) — still show results
  function finishEarly() {
    setDone(true);
  }

  if (done) {
    const finalScore = results.filter(r => r.ok).length;
    const deckLabel = (deck) => deck === 'hiragana' ? '平假名' : '片假名';
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.resultBox}>
            <div style={{ fontSize: 60 }}>{finalScore >= 8 ? '🏆' : finalScore >= 5 ? '😊' : '💪'}</div>
            <h2 style={styles.resultTitle}>測驗結束！</h2>
            <div style={styles.scoreBig}>{finalScore} <span style={{ fontSize: 22, color: '#999' }}>/ {results.length}</span></div>
            <p style={styles.resultSub}>{quizTypeLabel(quizType)}</p>

            {/* Wrong kana notice */}
            {markedUnknown.length > 0 && (
              <div style={styles.wrongNotice}>
                <p style={styles.wrongTitle}>⚠️ 以下字符已改回「還在學」</p>
                <div style={styles.wrongChars}>
                  {markedUnknown.map((m, i) => (
                    <span key={i} style={styles.wrongChar}>
                      {m.char}
                      <span style={styles.wrongDeck}>（{deckLabel(m.deck)}）</span>
                    </span>
                  ))}
                </div>
                <p style={styles.wrongHint}>下次練習學習卡時會重新出現這些字符。</p>
              </div>
            )}

            <div style={styles.reviewList}>
              {results.map((r, i) => (
                <div key={i} style={{ ...styles.reviewItem, borderColor: r.ok ? '#2a9d8f' : '#e63946' }}>
                  <span style={styles.reviewQ}>{r.question}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: r.ok ? '#2a9d8f' : '#e63946', fontWeight: 700 }}>
                      {r.ok ? '✓' : `✗ → ${r.correct}`}
                    </span>
                    {r.speakAnswer && (
                      <button onClick={() => speakSync(r.speakAnswer)} style={styles.miniSpeaker} title="發音">🔊</button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={() => navigate('/quiz')} style={{ ...styles.btn, background: '#555' }}>返回測驗</button>
              <button onClick={() => navigate('/home')} style={{ ...styles.btn, background: '#e63946' }}>首頁</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const color = quizType === 'multiChoice' ? '#e63946' : quizType === 'kanaConvert' ? '#457b9d' : quizType === 'confusable' ? '#f4a261' : '#2a9d8f';

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Top */}
        <div style={styles.topBar}>
          <button onClick={() => navigate('/quiz')} style={styles.backBtn}>← 返回</button>
          <span style={{ fontSize: 14, color: '#666' }}>{qIndex + 1} / {questions.length}</span>
          <span style={{ fontSize: 14, fontWeight: 700, color }}>得分：{score}</span>
        </div>

        {/* Progress */}
        <div style={{ background: '#eee', borderRadius: 8, height: 8, overflow: 'hidden', marginBottom: 24 }}>
          <div style={{ width: `${(qIndex / questions.length) * 100}%`, background: color, height: '100%', borderRadius: 8, transition: 'width 0.3s' }} />
        </div>

        {/* Question */}
        <div style={styles.questionCard}>
          {q?.questionLabel && <p style={styles.qLabel}>{q.questionLabel}</p>}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <div style={styles.questionChar}>{q?.question}</div>
            {/* 🔊 only show for non-MC, or after MC is answered */}
            {q?.speakText && (quizType !== 'multiChoice' && quizType !== 'confusable' && quizType !== 'chineseToJp' || submitted) && (
              <button onClick={() => speakSync(q.speakText)} style={styles.speakBtn} title="發音">🔊</button>
            )}
          </div>
          {q?.answerLabel && <p style={{ ...styles.qLabel, marginTop: 8 }}>請輸入{q.answerLabel}</p>}
        </div>

        {/* MC Options */}
        {q?.type === 'mc' && (
          <div style={styles.optionsGrid}>
            {q.options.map((opt, idx) => {
              let bg = '#fff', borderC = '#ddd', txtC = '#222';
              if (submitted) {
                if (opt === q.correct) { bg = '#d4edda'; borderC = '#2a9d8f'; txtC = '#2a9d8f'; }
                else if (opt === selected && opt !== q.correct) { bg = '#fde8e8'; borderC = '#e63946'; txtC = '#e63946'; }
              }
              const optFontSize = quizType === 'confusable' && /[\u3040-\u30FF]/.test(opt) ? 28 : 18;
              return (
                <button key={idx} onClick={() => submitMC(opt)}
                  style={{ ...styles.optBtn, background: bg, borderColor: borderC, color: txtC, fontSize: optFontSize }}>
                  {opt}
                </button>
              );
            })}
          </div>
        )}

        {/* Input */}
        {q?.type === 'input' && (
          <div style={styles.inputArea}>
            <input
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !submitted && submitInput()}
              placeholder={`輸入${q.answerLabel}`}
              disabled={submitted}
              style={{
                ...styles.inputField,
                borderColor: submitted ? (normalizeKana(inputVal.trim()) === normalizeKana(q.correct) ? '#2a9d8f' : '#e63946') : color,
              }}
              autoComplete="off"
              inputMode="text"
              lang="ja"
            />
            {submitted && (
              <div style={{ ...styles.feedback, color: normalizeKana(inputVal.trim()) === normalizeKana(q.correct) ? '#2a9d8f' : '#e63946' }}>
                <span>
                  {normalizeKana(inputVal.trim()) === normalizeKana(q.correct)
                    ? '✓ 正確！'
                    : `✗ 正確答案：${q.correct}${q.romaji ? ` (${q.romaji})` : ''}`}
                </span>
                {q.speakAnswer && (
                  <button onClick={() => speakSync(q.speakAnswer)} style={styles.speakBtn} title="發音">🔊</button>
                )}
              </div>
            )}
            {!submitted && (
              <button onClick={submitInput} style={{ ...styles.submitBtn, background: color }}>確認</button>
            )}
          </div>
        )}

        {/* Next / Finish early */}
        {submitted && (
          <button onClick={next} style={{ ...styles.nextBtn, background: color }}>
            {qIndex < questions.length - 1 ? '下一題 →' : '查看結果'}
          </button>
        )}

        {/* Quit mid-quiz */}
        {!submitted && qIndex > 0 && (
          <button onClick={finishEarly} style={styles.quitBtn}>結束並查看結果</button>
        )}
      </div>
    </div>
  );
}

function quizTypeLabel(type) {
  if (type === 'multiChoice') return '發音測驗';
  if (type === 'kanaConvert') return '假名轉換';
  if (type === 'chineseToJp') return '單字測驗';
  if (type === 'confusable') return '混淆字';
  return type;
}

const styles = {
  page: { minHeight: '100vh', background: '#f8f8f8' },
  container: { maxWidth: 430, margin: '0 auto', padding: '16px 16px 40px' },
  topBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  backBtn: { background: 'none', border: 'none', fontSize: 15, color: '#e63946', cursor: 'pointer', padding: 0 },
  questionCard: {
    background: '#fff', borderRadius: 16, padding: '28px 20px',
    textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', marginBottom: 20,
  },
  qLabel: { fontSize: 13, color: '#999', margin: '0 0 8px' },
  questionChar: { fontSize: 72, fontWeight: 900, color: '#222', lineHeight: 1 },
  speakBtn: {
    background: '#f0f0f0', border: 'none', borderRadius: 20,
    fontSize: 20, cursor: 'pointer', padding: '4px 10px', lineHeight: 1,
  },
  optionsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 },
  optBtn: {
    padding: '18px 0', borderRadius: 12, border: '2px solid',
    fontSize: 18, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
  },
  inputArea: { display: 'flex', flexDirection: 'column', gap: 12 },
  inputField: {
    border: '2px solid', borderRadius: 12, padding: '14px 16px',
    fontSize: 24, textAlign: 'center', outline: 'none', width: '100%',
    boxSizing: 'border-box', fontFamily: 'inherit',
  },
  feedback: { fontSize: 18, fontWeight: 700, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
  submitBtn: {
    padding: '14px 0', borderRadius: 12, border: 'none',
    color: '#fff', fontSize: 17, fontWeight: 700, cursor: 'pointer',
  },
  nextBtn: {
    width: '100%', marginTop: 20, padding: '16px 0', borderRadius: 12, border: 'none',
    color: '#fff', fontSize: 17, fontWeight: 700, cursor: 'pointer',
  },
  quitBtn: {
    width: '100%', marginTop: 12, padding: '12px 0', borderRadius: 12,
    border: '1.5px solid #ccc', background: 'transparent', color: '#999',
    fontSize: 14, cursor: 'pointer',
  },
  resultBox: {
    background: '#fff', borderRadius: 20, padding: '32px 24px', textAlign: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)', marginTop: 20,
  },
  resultTitle: { fontSize: 26, fontWeight: 800, margin: '8px 0' },
  scoreBig: { fontSize: 52, fontWeight: 900, color: '#e63946', lineHeight: 1, margin: '12px 0' },
  resultSub: { color: '#999', fontSize: 14, margin: '0 0 16px' },
  wrongNotice: {
    background: '#fff3cd', borderRadius: 12, padding: '12px 16px',
    marginBottom: 16, textAlign: 'left',
  },
  wrongTitle: { margin: '0 0 8px', fontSize: 14, fontWeight: 700, color: '#856404' },
  wrongChars: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 6 },
  wrongChar: { background: '#fff', borderRadius: 8, padding: '4px 10px', fontSize: 20, fontWeight: 700, border: '1.5px solid #f4a261' },
  wrongDeck: { fontSize: 11, color: '#999', fontWeight: 400, marginLeft: 2 },
  wrongHint: { margin: 0, fontSize: 12, color: '#856404' },
  reviewList: { display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'left', maxHeight: 220, overflowY: 'auto' },
  reviewItem: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: '#fafafa', borderRadius: 10, padding: '10px 14px', border: '1.5px solid',
  },
  reviewQ: { fontSize: 20, fontWeight: 700 },
  miniSpeaker: {
    background: '#f0f0f0', border: 'none', borderRadius: 16,
    fontSize: 14, cursor: 'pointer', padding: '2px 6px',
  },
  btn: { flex: 1, padding: '14px 0', borderRadius: 12, border: 'none', color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer' },
};
