// 混淆字組 — 外觀相似的假名，專門用於辨識訓練
export const confusables = [
  // ── 片假名互相混淆 ──
  { group: [
    { char: 'ン', romaji: 'n', deck: 'katakana' },
    { char: 'ソ', romaji: 'so', deck: 'katakana' },
  ]},
  { group: [
    { char: 'シ', romaji: 'shi', deck: 'katakana' },
    { char: 'ツ', romaji: 'tsu', deck: 'katakana' },
  ]},
  { group: [
    { char: 'ウ', romaji: 'u', deck: 'katakana' },
    { char: 'ワ', romaji: 'wa', deck: 'katakana' },
    { char: 'フ', romaji: 'fu', deck: 'katakana' },
  ]},
  { group: [
    { char: 'ク', romaji: 'ku', deck: 'katakana' },
    { char: 'タ', romaji: 'ta', deck: 'katakana' },
  ]},
  { group: [
    { char: 'ア', romaji: 'a', deck: 'katakana' },
    { char: 'マ', romaji: 'ma', deck: 'katakana' },
  ]},
  { group: [
    { char: 'コ', romaji: 'ko', deck: 'katakana' },
    { char: 'ユ', romaji: 'yu', deck: 'katakana' },
  ]},
  { group: [
    { char: 'ヌ', romaji: 'nu', deck: 'katakana' },
    { char: 'ス', romaji: 'su', deck: 'katakana' },
  ]},
  { group: [
    { char: 'ナ', romaji: 'na', deck: 'katakana' },
    { char: 'メ', romaji: 'me', deck: 'katakana' },
  ]},

  // ── 平假名互相混淆 ──
  { group: [
    { char: 'わ', romaji: 'wa', deck: 'hiragana' },
    { char: 'れ', romaji: 're', deck: 'hiragana' },
    { char: 'ね', romaji: 'ne', deck: 'hiragana' },
  ]},
  { group: [
    { char: 'は', romaji: 'ha', deck: 'hiragana' },
    { char: 'ほ', romaji: 'ho', deck: 'hiragana' },
    { char: 'ま', romaji: 'ma', deck: 'hiragana' },
  ]},
  { group: [
    { char: 'る', romaji: 'ru', deck: 'hiragana' },
    { char: 'ろ', romaji: 'ro', deck: 'hiragana' },
  ]},
  { group: [
    { char: 'め', romaji: 'me', deck: 'hiragana' },
    { char: 'ぬ', romaji: 'nu', deck: 'hiragana' },
  ]},
  { group: [
    { char: 'あ', romaji: 'a', deck: 'hiragana' },
    { char: 'お', romaji: 'o', deck: 'hiragana' },
  ]},
  { group: [
    { char: 'き', romaji: 'ki', deck: 'hiragana' },
    { char: 'さ', romaji: 'sa', deck: 'hiragana' },
  ]},
  { group: [
    { char: 'い', romaji: 'i', deck: 'hiragana' },
    { char: 'り', romaji: 'ri', deck: 'hiragana' },
  ]},

  // ── 跨平片假名混淆（不同讀音）──
  { group: [
    { char: 'う', romaji: 'u', deck: 'hiragana' },
    { char: 'ラ', romaji: 'ra', deck: 'katakana' },
  ]},
];
