import Sidebar from './Sidebar';
import MetricCard from './MetricCard';
import APIManager from './APIManager';
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { apiStorage } from '../services/apiStorage';
import GlassCard from './GlassCard';

const metrics = [
  { label: 'TOTAL PROFIT', value: '$24,500', color: 'green' },
  { label: 'TOTAL TRADES', value: '1,258', color: 'blue' },
  { label: 'WON / LOST', value: '845 / 413', color: 'orange' },
  { label: 'RATIO', value: '2.05', color: 'blue' },
  { label: 'CREATED VAULTS', value: '12', color: 'green' },
  { label: 'ACTIVE VAULTS', value: '4', color: 'green' },
  { label: 'COMPLETED VAULTS', value: '8', color: 'white' },
  { label: 'INVESTORS', value: '82', color: 'blue' },
  { label: 'TOTAL MONEY INVESTED', value: '$1,072,000', color: 'orange' },
  { label: 'TOTAL MONEY PAID', value: '$1,096,500', color: 'white' },
  { label: 'TOTAL FEES', value: '$35,120', color: 'blue' },
];

export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [error, setError] = useState('');
  const [showResetInfo, setShowResetInfo] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!apiStorage.verifyPassword(password)) {
      setError('Invalid password');
      return;
    }
  };

  useEffect(() => {
    if (apiStorage.passwordHash) {
      setIsAuthenticated(false); // Show unlock, not set password
    }
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar setCurrentPage={setCurrentPage} />
      <main className="dashboard-main">
        {currentPage === 'api' ? (
          <APIManager />
        ) : (
          <>
            <div className="dashboard-title">Dashboard</div>
            <div className="dashboard-subtitle">Trading performance overview</div>
            <div className="metrics-grid">
              {metrics.map((m) => (
                <MetricCard key={m.label} {...m} />
              ))}
            </div>
            <div className="text-right mt-2">
              <button
                type="button"
                className="text-blue-400 underline text-sm"
                onClick={() => setShowResetInfo(true)}
              >
                Forgot Password?
              </button>
            </div>
            {showResetInfo && (
              <div className="mt-2 text-sm text-gray-300">
                To reset your password, contact the master account: <b>seme@kryptostack.com</b>
                <button
                  className="ml-2 px-2 py-1 bg-blue-500 text-white rounded"
                  onClick={() => window.open('mailto:seme@kryptostack.com')}
                >
                  Email Now
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
} 