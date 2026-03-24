import { useNavigate, useLocation } from 'react-router-dom';

const tabs = [
  { path: '/home', label: '首頁', icon: '🏠' },
  { path: '/kana-chart', label: '假名表', icon: '📊' },
  { path: '/flashcards', label: '學習卡', icon: '📇' },
  { path: '/quiz', label: '測驗', icon: '✏️' },
  { path: '/leaderboard', label: '排行榜', icon: '🏆' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 430,
      background: '#fff', borderTop: '1px solid #eee',
      display: 'flex', justifyContent: 'space-around',
      padding: '8px 0 env(safe-area-inset-bottom, 8px)',
      zIndex: 100,
    }}>
      {tabs.map(tab => {
        const active = location.pathname.startsWith(tab.path);
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            style={{
              flex: 1, border: 'none', background: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              padding: '4px 0', color: active ? '#e63946' : '#999',
            }}
          >
            <span style={{ fontSize: 22 }}>{tab.icon}</span>
            <span style={{ fontSize: 11, fontWeight: active ? 700 : 400 }}>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
