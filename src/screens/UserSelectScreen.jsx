import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function UserSelectScreen() {
  const { store, selectUser, addUser, deleteUser } = useApp();
  const navigate = useNavigate();
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  function handleSelect(name) {
    selectUser(name);
    navigate('/home');
  }

  function handleAdd() {
    if (!newName.trim()) { setError('請輸入名稱'); return; }
    const ok = addUser(newName.trim());
    if (!ok) { setError('名稱已存在或人數已滿 (最多10人)'); return; }
    setNewName('');
    setAdding(false);
    setError('');
  }

  const slots = [...store.users, ...Array(Math.max(0, 1 - (store.users.length > 0 ? 0 : 1))).fill(null)];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.logo}>🇯🇵</div>
        <h1 style={styles.title}>學日語</h1>
        <p style={styles.subtitle}>請選擇您的帳號</p>
      </div>

      <div style={styles.list}>
        {store.users.map(name => (
          <div key={name} style={styles.userRow}>
            <button onClick={() => handleSelect(name)} style={styles.userBtn}>
              <span style={styles.avatar}>{name[0].toUpperCase()}</span>
              <span style={styles.userName}>{name}</span>
            </button>
            <button onClick={() => deleteUser(name)} style={styles.deleteBtn} title="刪除">✕</button>
          </div>
        ))}

        {store.users.length < 10 && (
          adding ? (
            <div style={styles.addForm}>
              <input
                autoFocus
                value={newName}
                onChange={e => { setNewName(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                placeholder="輸入名稱"
                style={styles.input}
                maxLength={12}
              />
              {error && <p style={styles.error}>{error}</p>}
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleAdd} style={styles.confirmBtn}>確認</button>
                <button onClick={() => { setAdding(false); setError(''); setNewName(''); }} style={styles.cancelBtn}>取消</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setAdding(true)} style={styles.addBtn}>
              <span style={{ fontSize: 24 }}>＋</span>
              <span>新增使用者</span>
            </button>
          )
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh', background: 'linear-gradient(135deg, #e63946 0%, #c1121f 100%)',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '40px 20px', boxSizing: 'border-box',
  },
  header: { textAlign: 'center', marginBottom: 40 },
  logo: { fontSize: 64, marginBottom: 8 },
  title: { color: '#fff', fontSize: 36, fontWeight: 900, margin: 0, letterSpacing: 4 },
  subtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 16, margin: '8px 0 0' },
  list: { width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 12 },
  userRow: { display: 'flex', alignItems: 'center', gap: 8 },
  userBtn: {
    flex: 1, display: 'flex', alignItems: 'center', gap: 14,
    background: '#fff', borderRadius: 14, padding: '14px 16px', border: 'none',
    cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
  },
  avatar: {
    width: 40, height: 40, borderRadius: '50%', background: '#e63946',
    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 18, fontWeight: 700, flexShrink: 0,
    lineHeight: '40px', textAlign: 'center',
  },
  userName: { fontSize: 17, fontWeight: 600, color: '#222' },
  deleteBtn: {
    width: 36, height: 36, borderRadius: '50%', border: 'none',
    background: 'rgba(255,255,255,0.3)', color: '#fff', cursor: 'pointer', fontSize: 14,
  },
  addBtn: {
    display: 'flex', alignItems: 'center', gap: 10,
    background: 'rgba(255,255,255,0.2)', border: '2px dashed rgba(255,255,255,0.6)',
    borderRadius: 14, padding: '14px 16px', color: '#fff', fontSize: 16,
    cursor: 'pointer', width: '100%',
  },
  addForm: {
    background: '#fff', borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column', gap: 10,
  },
  input: {
    border: '2px solid #e63946', borderRadius: 10, padding: '10px 14px',
    fontSize: 16, outline: 'none', width: '100%', boxSizing: 'border-box',
  },
  error: { color: '#e63946', fontSize: 13, margin: 0 },
  confirmBtn: {
    flex: 1, padding: '10px 0', borderRadius: 10, border: 'none',
    background: '#e63946', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
  },
  cancelBtn: {
    flex: 1, padding: '10px 0', borderRadius: 10, border: '2px solid #ccc',
    background: '#fff', color: '#666', fontSize: 15, cursor: 'pointer',
  },
};
