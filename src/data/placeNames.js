// 日本常見地名 — 漢字/假名/羅馬拼音對照
export const placeNames = [
  // ── 日本地方（區域）名 ──
  { kanji: "北海道", kana: "ほっかいどう", romaji: "Hokkaido", category: "地方" },
  { kanji: "東北地方", kana: "とうほくちほう", romaji: "Tohoku", category: "地方" },
  { kanji: "關東地方", kana: "かんとうちほう", romaji: "Kanto", category: "地方" },
  { kanji: "中部地方", kana: "ちゅうぶちほう", romaji: "Chubu", category: "地方" },
  { kanji: "近畿地方", kana: "きんきちほう", romaji: "Kinki / Kansai", category: "地方" },
  { kanji: "中國地方", kana: "ちゅうごくちほう", romaji: "Chugoku", category: "地方" },
  { kanji: "四國", kana: "しこく", romaji: "Shikoku", category: "地方" },
  { kanji: "九州", kana: "きゅうしゅう", romaji: "Kyushu", category: "地方" },
  { kanji: "沖繩", kana: "おきなわ", romaji: "Okinawa", category: "地方" },

  // ── 日本主要機場 ──
  { kanji: "羽田機場", kana: "はねだくうこう", romaji: "Haneda Airport", category: "機場" },
  { kanji: "成田機場", kana: "なりたくうこう", romaji: "Narita Airport", category: "機場" },
  { kanji: "新千歲機場", kana: "しんちとせくうこう", romaji: "Shin-Chitose Airport", category: "機場" },

  // ── 北海道行程地點 ──
  { kanji: "札幌", kana: "さっぽろ", romaji: "Sapporo", category: "北海道" },
  { kanji: "富良野", kana: "ふらの", romaji: "Furano", category: "北海道" },
  { kanji: "美瑛", kana: "びえい", romaji: "Biei", category: "北海道" },
  { kanji: "旭川", kana: "あさひかわ", romaji: "Asahikawa", category: "北海道" },
  { kanji: "阿寒湖", kana: "あかんこ", romaji: "Lake Akan", category: "北海道" },
  { kanji: "屈斜路湖", kana: "くっしゃろこ", romaji: "Lake Kussharo", category: "北海道" },
  { kanji: "摩周湖", kana: "ましゅうこ", romaji: "Lake Mashu", category: "北海道" },
  { kanji: "知床", kana: "しれとこ", romaji: "Shiretoko", category: "北海道" },
  { kanji: "宇登呂", kana: "うとろ", romaji: "Utoro", category: "北海道" },
  { kanji: "斜里", kana: "しゃり", romaji: "Shari", category: "北海道" },
  { kanji: "羅臼", kana: "らうす", romaji: "Rausu", category: "北海道" },
  { kanji: "網走", kana: "あばしり", romaji: "Abashiri", category: "北海道" },
  { kanji: "女滿別", kana: "めまんべつ", romaji: "Memanbetsu", category: "北海道" },
  { kanji: "函館", kana: "はこだて", romaji: "Hakodate", category: "北海道" },
  { kanji: "小樽", kana: "おたる", romaji: "Otaru", category: "北海道" },

  // ── 日本主要城市 ──
  { kanji: "東京", kana: "とうきょう", romaji: "Tokyo", category: "城市" },
  { kanji: "京都", kana: "きょうと", romaji: "Kyoto", category: "城市" },
  { kanji: "大阪", kana: "おおさか", romaji: "Osaka", category: "城市" },
  { kanji: "橫濱", kana: "よこはま", romaji: "Yokohama", category: "城市" },
  { kanji: "名古屋", kana: "なごや", romaji: "Nagoya", category: "城市" },
  { kanji: "神戶", kana: "こうべ", romaji: "Kobe", category: "城市" },
  { kanji: "奈良", kana: "なら", romaji: "Nara", category: "城市" },
  { kanji: "廣島", kana: "ひろしま", romaji: "Hiroshima", category: "城市" },
  { kanji: "福岡", kana: "ふくおか", romaji: "Fukuoka", category: "城市" },
  { kanji: "那霸", kana: "なは", romaji: "Naha", category: "城市" },
  { kanji: "金澤", kana: "かなざわ", romaji: "Kanazawa", category: "城市" },
  { kanji: "尾道", kana: "おのみち", romaji: "Onomichi", category: "城市" },
  { kanji: "熊本", kana: "くまもと", romaji: "Kumamoto", category: "城市" },

  // ── 東京都內區域 ──
  { kanji: "新宿", kana: "しんじゅく", romaji: "Shinjuku", category: "東京" },
  { kanji: "澀谷", kana: "しぶや", romaji: "Shibuya", category: "東京" },
  { kanji: "銀座", kana: "ぎんざ", romaji: "Ginza", category: "東京" },
  { kanji: "淺草", kana: "あさくさ", romaji: "Asakusa", category: "東京" },
  { kanji: "上野", kana: "うえの", romaji: "Ueno", category: "東京" },
  { kanji: "品川", kana: "しながわ", romaji: "Shinagawa", category: "東京" },
  { kanji: "台場", kana: "おだいば", romaji: "Odaiba", category: "東京" },
  { kanji: "六本木", kana: "ろっぽんぎ", romaji: "Roppongi", category: "東京" },
  { kanji: "池袋", kana: "いけぶくろ", romaji: "Ikebukuro", category: "東京" },

  // ── 四國主要城市 ──
  { kanji: "高松", kana: "たかまつ", romaji: "Takamatsu", category: "四國" },
  { kanji: "松山", kana: "まつやま", romaji: "Matsuyama", category: "四國" },
  { kanji: "德島", kana: "とくしま", romaji: "Tokushima", category: "四國" },
  { kanji: "高知", kana: "こうち", romaji: "Kochi", category: "四國" },
  { kanji: "今治", kana: "いまばり", romaji: "Imabari", category: "四國" },
  { kanji: "伊予大洲", kana: "いよおおず", romaji: "Iyo-Ozu", category: "四國" },

  // ── 常見景點 ──
  { kanji: "瀨戶內海", kana: "せとないかい", romaji: "Seto Inland Sea", category: "景點" },
  { kanji: "箱根", kana: "はこね", romaji: "Hakone", category: "景點" },
  { kanji: "小豆島", kana: "しょうどしま", romaji: "Shodoshima", category: "景點" },
  { kanji: "直島", kana: "なおしま", romaji: "Naoshima", category: "景點" },
  { kanji: "豐島", kana: "てしま", romaji: "Teshima", category: "景點" },
];
