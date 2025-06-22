import logoZmart from '../assets/logoZmart.png';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/session`, { withCredentials: true });
      setUser(response.data.user);
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add Settings to menu if user is SuperAdmin
  const getMenuItems = () => {
    const items = [...menu];
    
    // Add Settings tab only for SuperAdmin
    if (user?.is_superadmin) {
      items.push({ label: 'Settings', icon: '⚙️' });
    }
    
    return items;
  };

  if (loading) {
    return (
      <aside className="sidebar">
        <div className="sidebar-logo" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 32px 32px 32px', background: 'transparent' }}>
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
        <div className="text-center text-gray-400">Loading...</div>
      </aside>
    );
  }

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
      
      {/* User Info */}
      {user && (
        <div className="px-4 py-2 mb-4 border-b border-gray-700">
          <div className="text-sm text-gray-300">
            <div className="font-medium">{user.name || user.email}</div>
            <div className="text-xs text-gray-500">
              {user.is_superadmin ? 'SuperAdmin' : user.is_admin ? 'Admin' : 'User'}
            </div>
          </div>
        </div>
      )}
      
      <nav className="sidebar-menu" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {getMenuItems().map((item) => (
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
              {item.label === 'Settings' && user?.is_superadmin && (
                <span style={{ marginLeft: 'auto', fontSize: '0.8em', color: '#22ff88' }}>🔒</span>
              )}
            </div>
          )
        ))}
      </nav>
    </aside>
  );
} 