import React, { useState, useEffect } from 'react';
import GlassCard from './GlassCard';

const Roadmap = () => {
  const [roadmapData, setRoadmapData] = useState({
    date: '',
    achievements: []
  });

  useEffect(() => {
    // Fetch roadmap data from the backend
    fetch('/api/roadmap')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setRoadmapData(data.roadmap);
        }
      })
      .catch(error => {
        console.error('Error fetching roadmap:', error);
        // Fallback to static data
        setRoadmapData({
          date: '2025-06-23',
          achievements: [
            '✅ Project bootstrapped with React, Vite, and Tailwind CSS',
            '✅ Secure API key manager with password hashing and encryption',
            '✅ Persistent password and API key storage (localStorage + encryption)',
            '✅ API Manager: add, view, and delete API keys (KuCoin, Cryptometer, etc.)',
            '✅ Backend Flask server with user/session management and CORS',
            '✅ KuCoin price proxy endpoint (secure, uses stored API keys)',
            '✅ Frontend KucoinPrice component fetches live BTC/USDT price',
            '✅ Debugged and fixed CSS import order for Vite compatibility',
            '✅ Fixed FERNET_KEY for consistent encryption/decryption',
            '✅ End-to-end test: KuCoin API key securely stored, price fetch works',
            '✅ Documentation tab with Roadmap and achievements',
            '✅ Complete authentication system with SuperAdmin and regular admins',
            '✅ Admin management system with activity logging',
            '✅ Version automation system with Git integration',
            '✅ Startup and shutdown automation scripts',
            '✅ API key security improvements and management'
          ]
        });
      });
  }, []);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Project Roadmap</h1>
        <p className="text-gray-300">Track our progress and achievements</p>
      </div>

      <GlassCard>
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-2">Current Status</h2>
            <p className="text-gray-300">Last updated: {roadmapData.date}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Achievements</h3>
            <div className="space-y-3">
              {roadmapData.achievements.map((achievement, index) => (
                <div key={index} className="flex items-start">
                  <span className="text-green-400 mr-3 mt-1">✓</span>
                  <span className="text-gray-200">{achievement}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-600 pt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Next Milestones</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <span className="text-blue-400 mr-3 mt-1">→</span>
                <span className="text-gray-300">KingFisher liquidation analysis integration</span>
              </div>
              <div className="flex items-start">
                <span className="text-blue-400 mr-3 mt-1">→</span>
                <span className="text-gray-300">RiskMetric scoring system implementation</span>
              </div>
              <div className="flex items-start">
                <span className="text-blue-400 mr-3 mt-1">→</span>
                <span className="text-gray-300">Cryptometer API integration for market data</span>
              </div>
              <div className="flex items-start">
                <span className="text-blue-400 mr-3 mt-1">→</span>
                <span className="text-gray-300">25-point scoring system for trading decisions</span>
              </div>
              <div className="flex items-start">
                <span className="text-blue-400 mr-3 mt-1">→</span>
                <span className="text-gray-300">Automated trading execution system</span>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default Roadmap; 