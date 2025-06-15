export default function MetricCard({ label, value, color, sub }) {
  return (
    <div className={`metric-card neon-border-${color}`}>
      <div className="metric-label">{label}</div>
      <div className={`metric-value neon-${color}`}>{value}</div>
      {sub && <div className="metric-sub">{sub}</div>}
    </div>
  );
} 