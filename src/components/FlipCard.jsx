import { useState, useEffect } from 'react';
import { speak, speakSync } from '../utils/speech';

// frontText: text to speak on front (the kana char)
// backText: text to speak on back (the full word)
export default function FlipCard({ front, back, frontText, backText, onKnow, onDontKnow }) {
  const [flipped, setFlipped] = useState(false);

  // Auto-speak front when card appears
  useEffect(() => {
    if (frontText) setTimeout(() => speak(frontText), 400);
  }, [frontText]);

  function handleFlip() {
    const nowFlipped = !flipped;
    setFlipped(nowFlipped);
    // Speak synchronously — we're inside a click handler (user gesture)
    if (nowFlipped && backText) speakSync(backText);
    else if (!nowFlipped && frontText) speakSync(frontText);
  }

  function handleKnow(e) {
    e.stopPropagation();
    setFlipped(false);
    onKnow?.();
  }

  function handleDontKnow(e) {
    e.stopPropagation();
    setFlipped(false);
    onDontKnow?.();
  }

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      {/* Card */}
      <div
        onClick={handleFlip}
        style={{ width: '100%', maxWidth: 340, height: 240, cursor: 'pointer', perspective: 1000 }}
      >
        <div style={{
          position: 'relative', width: '100%', height: '100%',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.5s',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}>
          {/* Front */}
          <div style={{
            position: 'absolute', width: '100%', height: '100%',
            backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
            background: '#fff', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            {front}
            {frontText && (
              <button
                onClick={e => { e.stopPropagation(); speakSync(frontText); }}
                style={speakerBtnStyle('#f0f0f0')}
                title="發音"
              >🔊</button>
            )}
          </div>

          {/* Back */}
          <div style={{
            position: 'absolute', width: '100%', height: '100%',
            backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: '#fff7f7', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            {back}
            {backText && (
              <button
                onClick={e => { e.stopPropagation(); speakSync(backText); }}
                style={speakerBtnStyle('#fde8e8')}
                title="發音"
              >🔊</button>
            )}
          </div>
        </div>
      </div>

      <p style={{ fontSize: 13, color: '#999', margin: 0 }}>點擊卡片翻面・🔊 聆聽發音</p>

      {/* Buttons */}
      {flipped && (
        <div style={{ display: 'flex', gap: 16, width: '100%', maxWidth: 340 }}>
          <button onClick={handleDontKnow} style={{
            flex: 1, padding: '14px 0', borderRadius: 12, border: '2px solid #e63946',
            background: '#fff', color: '#e63946', fontSize: 16, fontWeight: 700, cursor: 'pointer',
          }}>✗ 還在學</button>
          <button onClick={handleKnow} style={{
            flex: 1, padding: '14px 0', borderRadius: 12, border: 'none',
            background: '#2a9d8f', color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer',
          }}>✓ 已學會</button>
        </div>
      )}
    </div>
  );
}

function speakerBtnStyle(bg) {
  return {
    position: 'absolute', bottom: 10, right: 12,
    background: bg, border: 'none', borderRadius: 20,
    fontSize: 18, cursor: 'pointer', padding: '4px 8px',
    lineHeight: 1, zIndex: 2,
  };
}
