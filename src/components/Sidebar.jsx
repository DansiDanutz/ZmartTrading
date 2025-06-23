import logoZmart from '../assets/logoZmart.png';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

const menu = [
  { label: 'quick-trade', display: 'Quick Trade', icon: '⚡' },
  { label: 'analytics', display: 'Analytics', icon: '📈' },
  { label: 'symbols', display: 'Symbols', icon: '⌗' },
  { label: 'scoring', display: 'Scoring', icon: '⭘', sub: [
    { label: 'cryptometer', display: 'Cryptometer', icon: '🧮' },
    { label: 'riskmetric', display: 'RiskMetric', icon: '🛡️' },
    { label: 'kingfisher', display: 'KingFisher', icon: '🧊' },
  ]},
  { label: 'vaults', display: 'Vaults', icon: '🔒' },
  { label: 'investors', display: 'Investors', icon: '👤' },
  { label: 'history', display: 'History', icon: '🕒' },
  { label: 'blog', display: 'Blog', icon: '📄' },
  { label: 'roadmap', display: 'Roadmap', icon: '🚂' },
  { label: 'examples', display: 'Examples', icon: '📚' },
  { label: 'api', display: 'API', icon: '🛠️' },
  { label: 'website', display: 'Website', icon: '🌐' },
];

export default function Sidebar({ setCurrentPage, currentPage }) {
  const [scoringOpen, setScoringOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(null);
  const [logoClicked, setLogoClicked] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/session`, { withCredentials: true });
      setUser(response.data.user);
    } catch (error) {
      // silent fail
    } finally {
      setLoading(false);
    }
  };

  // Add Settings to menu if user is SuperAdmin
  const getMenuItems = () => {
    const items = [...menu];
    if (user?.is_superadmin) {
      items.push({ label: 'settings', display: 'Settings', icon: '⚙️' });
    }
    return items;
  };

  const handleLogoClick = () => {
    setLogoClicked(true);
    setCurrentPage('dashboard');
    // Reset active tab state when logo is clicked
    setActiveTab(null);
    
    // Reset the click effect after animation
    setTimeout(() => {
      setLogoClicked(false);
    }, 300);
  };

  return (
    <aside className="relative z-20 w-72 min-h-screen bg-[#181A20] border-r border-[#23272F] flex flex-col shadow-2xl">
      {/* Logo */}
      <div className="flex flex-col items-center py-8 cursor-pointer select-none" onClick={handleLogoClick}>
        <img 
          src={logoZmart} 
          alt="Zmart Trading Bot Logo" 
          className={`w-32 h-32 rounded-2xl shadow-lg border-2 border-[#23272F] object-contain mb-2 transition-all duration-200 hover:ring-4 hover:ring-[#00FF94]/30 ${
            logoClicked 
              ? 'scale-95 ring-4 ring-[#00FF94]/50 shadow-[0_0_20px_rgba(0,255,148,0.3)]' 
              : 'scale-100'
          }`} 
        />
        <span className={`text-white text-2xl font-bold tracking-wide mt-2 transition-all duration-200 ${
          logoClicked ? 'text-[#00FF94] scale-105' : ''
        }`}>
          ZmartTrading
        </span>
      </div>

      {/* User Info */}
      {user && (
        <div className="mx-6 mb-6 p-4 rounded-xl bg-[#181A20] border border-[#23272F] flex items-center gap-4 shadow">
          <div className="w-12 h-12 bg-[#00FF94] rounded-full flex items-center justify-center text-[#181A20] text-xl font-bold">
            {(user.name || user.email).charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-white font-semibold text-lg leading-tight">{user.name || user.email}</div>
            <div className="text-xs text-[#00FF94] font-medium">
              {user.is_superadmin ? 'Super Admin' : user.is_admin ? 'Administrator' : 'User'}
            </div>
          </div>
        </div>
      )}

      {/* Menu */}
      <nav className="flex-1 px-4">
        <ul className="space-y-2">
          {getMenuItems().map((item) => (
            item.label === 'scoring' ? (
              <li key={item.label}>
                <button
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group
                    ${currentPage === item.label
                      ? 'bg-[#00FF94] text-white font-semibold shadow-lg'
                      : 'text-white hover:bg-[#00FF94] hover:text-white'
                    }
                    ${activeTab === item.label ? 'border-2 border-[#00FF94]' : 'border-2 border-transparent'}
                  `}
                  onClick={() => setScoringOpen((v) => !v)}
                >
                  <span className={`text-xl transition-colors duration-200
                    ${currentPage === item.label
                      ? 'text-white'
                      : 'group-hover:text-white'
                    }
                  `}>
                    {item.icon}
                  </span>
                  <span className="font-medium">{item.display}</span>
                  <span className="ml-auto text-[#00FF94]">{scoringOpen ? '▾' : '▸'}</span>
                </button>
                {scoringOpen && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.sub.map((sub) => (
                      <button
                        key={sub.label}
                        className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-150 text-[#00FF94] font-medium hover:bg-[#23272F] 
                          ${currentPage === sub.label ? 'bg-[#23272F] border-l-4 border-[#00FF94]' : ''}
                          ${activeTab === sub.label ? 'border-2 border-[#00FF94]' : 'border-2 border-transparent'}
                        `}
                        onClick={() => {
                          setCurrentPage(sub.label);
                          setActiveTab(sub.label);
                        }}
                      >
                        <span className="text-lg">{sub.icon}</span>
                        <span>{sub.display}</span>
                      </button>
                    ))}
                  </div>
                )}
              </li>
            ) : (
              <li key={item.label}>
                <button
                  onClick={() => {
                    setCurrentPage(item.label);
                    setActiveTab(item.label);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group
                    ${currentPage === item.label
                      ? 'bg-[#181A20] text-[#00FF94] font-semibold shadow-lg border-2 border-[#00FF94]'
                      : 'bg-[#181A20] text-white border-2 border-transparent hover:bg-[#00FF94] hover:text-white'
                    }
                  `}
                >
                  <span className={`text-xl transition-colors duration-200
                    ${currentPage === item.label
                      ? 'text-[#00FF94]'
                      : 'text-white group-hover:text-white'
                    }
                  `}>
                    {item.icon}
                  </span>
                  <span className="font-medium">{item.display}</span>
                  {item.label === 'settings' && user?.is_superadmin && (
                    <span className="ml-auto text-[#00FF94]">🔒</span>
                  )}
                </button>
              </li>
            )
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="mt-auto mb-6 px-6 text-center text-xs text-[#b0b8c1] opacity-70">
        &copy; {new Date().getFullYear()} ZmartTrading. All rights reserved.
      </div>
    </aside>
  );
} 