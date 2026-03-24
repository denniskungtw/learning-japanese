export default function ProgressBar({ value, max, color = '#e63946' }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4, color: '#666' }}>
        <span>{value} / {max}</span>
        <span>{pct}%</span>
      </div>
      <div style={{ background: '#eee', borderRadius: 8, height: 10, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, background: color, height: '100%', borderRadius: 8, transition: 'width 0.4s ease' }} />
      </div>
    </div>
  );
}
