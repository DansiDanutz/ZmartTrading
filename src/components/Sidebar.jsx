import logoZmart from '../assets/logoZmart.png';
import React, { useState } from 'react';

const menu = [
  { label: 'Quick Trade', icon: '⚡' },
  { label: 'Analytics', icon: '📈' },
  { label: 'Symbols', icon: '⌗' },
  { label: 'Scoring', icon: '⭘', sub: [
    { label: 'Cryptometer', icon: '🧮' },
    { label: 'RiskMetric', icon: '🛡️' },
    { label: 'KingFisher', icon: '🧊' },
  ]},
  { label: 'Vaults', icon: '🔒' },
  { label: 'Investors', icon: '👤' },
  { label: 'History', icon: '🕒' },
  { label: 'Blog', icon: '📄' },
  { label: 'Documentation', icon: '💻' },
  { label: 'Examples', icon: '📚' },
  { label: 'API', icon: '🛠️' },
  { label: 'Website', icon: '🌐' },
];

export default function Sidebar({ setCurrentPage }) {
  const [scoringOpen, setScoringOpen] = useState(false);
  return (
    <aside className="sidebar">
      <div className="sidebar-logo" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 32px 32px 32px', background: 'transparent', cursor: 'pointer' }} onClick={() => setCurrentPage('dashboard')}>
        <img
          src={logoZmart}
          alt="Zmart Trading Bot Logo"
          style={{
            width: '100%',
            maxWidth: 420,
            height: 'auto',
            borderRadius: 24,
            boxShadow: '0 0 32px 4px #22ff88, 0 0 0 2px #222 inset',
            background: 'linear-gradient(120deg, rgba(34,255,136,0.08) 0%, rgba(34,255,136,0.02) 100%)',
            filter: 'drop-shadow(0 0 16px #22ff88) drop-shadow(0 0 2px #222)',
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </div>
      <nav className="sidebar-menu" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {menu.map((item) => (
          item.label === 'Scoring' ? (
            <div key={item.label} style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="sidebar-menu-item" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => setScoringOpen(v => !v)}>
                <span className="sidebar-menu-icon">{item.icon}</span>
                <span>{item.label}</span>
                <span style={{ marginLeft: 'auto', fontSize: '1.1em', color: '#22ff88' }}>{scoringOpen ? '▾' : '▸'}</span>
              </div>
              {scoringOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginLeft: 32, borderLeft: '2px solid #22ff88', paddingLeft: 16, marginTop: 2 }}>
                  {item.sub.map(sub => (
                    <div key={sub.label} className="sidebar-menu-item" style={{ fontSize: '1rem', color: '#b0ffcc', padding: '6px 0', display: 'flex', alignItems: 'center', gap: 10, fontWeight: 500 }}>
                      <span className="sidebar-menu-icon">{sub.icon}</span>
                      <span>{sub.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div key={item.label} className="sidebar-menu-item" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => setCurrentPage(item.label.toLowerCase())}>
              <span className="sidebar-menu-icon">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          )
        ))}
      </nav>
    </aside>
  );
} 