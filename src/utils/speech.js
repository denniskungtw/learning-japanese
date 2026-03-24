// Web Speech API utility for Japanese TTS

// Single hiragana/katakana in isolation can confuse TTS engines.
// Appending 。 gives a sentence boundary that helps pronunciation.
function process(text) {
  if (!text) return '';
  return text.length <= 2 ? text + '。' : text;
}

function buildUtterance(text, rate) {
  const utter = new SpeechSynthesisUtterance(process(text));
  utter.lang = 'ja-JP';
  utter.rate = rate;
  utter.pitch = 1;
  const voices = speechSynthesis.getVoices();
  const jpVoice = voices.find(v => v.lang === 'ja-JP' || v.lang === 'ja');
  if (jpVoice) utter.voice = jpVoice;
  return utter;
}

// ── Synchronous speak ────────────────────────────────────────────────────────
// MUST be called directly inside a user-gesture handler (onClick, etc.).
// On iOS, speak() inside setTimeout loses the gesture context and silently fails.
export function speakSync(text, rate = 0.85) {
  if (!('speechSynthesis' in window) || !text) return;
  speechSynthesis.cancel();
  speechSynthesis.speak(buildUtterance(text, rate));
}

// ── Async speak ──────────────────────────────────────────────────────────────
// For auto-speaks triggered by state changes (useEffect), not user gestures.
// Uses a small delay to work around the Chrome/Android cancel→speak drop bug.
// May silently fail on iOS (no user gesture) — that is expected.
export function speak(text, rate = 0.85) {
  if (!('speechSynthesis' in window) || !text) return;

  speechSynthesis.cancel();

  const fire = () => speechSynthesis.speak(buildUtterance(text, rate));

  const voices = speechSynthesis.getVoices();
  if (voices.length > 0) {
    setTimeout(fire, 120);
  } else {
    const onReady = () => {
      speechSynthesis.removeEventListener('voiceschanged', onReady);
      setTimeout(fire, 120);
    };
    speechSynthesis.addEventListener('voiceschanged', onReady);
    // Fallback if voiceschanged never fires
    setTimeout(() => {
      speechSynthesis.removeEventListener('voiceschanged', onReady);
      fire();
    }, 700);
  }
}

// Convenience wrapper: delay then async-speak (for useEffect auto-speaks)
export function speakDelayed(text, ms = 300, rate = 0.85) {
  setTimeout(() => speak(text, rate), ms);
}
