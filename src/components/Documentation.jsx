import React, { useState } from 'react';

const today = new Date().toLocaleDateString();

const achievements = [
  {
    date: today,
    details: [
      '✅ Project bootstrapped with React, Vite, and Tailwind CSS',
      '✅ Secure API key manager with password hashing and encryption',
      '✅ Persistent password and API key storage (localStorage + encryption)',
      '✅ API Manager: add, view, and delete API keys (KuCoin, Cryptometer, etc.)',
      '✅ Backend Flask server with user/session management and CORS',
      '✅ KuCoin price proxy endpoint (secure, uses stored API keys)',
      '✅ Frontend KucoinPrice component fetches live BTC/USDT price',
      '✅ Debugged and fixed CORS, session, and FERNET_KEY issues',
      '✅ Automated clearing and re-adding of API keys for encryption consistency',
      '✅ CSS import order fixed for Tailwind and font imports',
      '✅ All servers run with correct environment and persistent keys',
      '✅ End-to-end test: live price fetch from KuCoin with secure storage',
    ]
  }
];

const menu = [
  { label: 'Roadmap' },
  // Add more tabs here as needed
];

export default function Documentation() {
  const [activeTab, setActiveTab] = useState('Roadmap');

  return (
    <div className="w-full">
      {/* Horizontal menu */}
      <div className="flex border-b border-border mb-6">
        {menu.map(tab => (
          <button
            key={tab.label}
            className={`px-6 py-3 font-semibold text-lg focus:outline-none transition border-b-2 ${activeTab === tab.label ? 'border-neon-green text-neon-green' : 'border-transparent text-muted-foreground hover:text-neon-green'}`}
            onClick={() => setActiveTab(tab.label)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* Tab content */}
      {activeTab === 'Roadmap' && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-2">Roadmap as of {today}</h2>
          <ul className="list-disc pl-6 space-y-2">
            {achievements[0].details.map((item, idx) => (
              <li key={idx} className="text-lg">{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 