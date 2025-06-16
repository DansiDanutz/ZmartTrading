import Sidebar from './Sidebar';
import MetricCard from './MetricCard';
import APIManager from './APIManager';
import React, { useState } from 'react';

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
          </>
        )}
      </main>
    </div>
  );
} 