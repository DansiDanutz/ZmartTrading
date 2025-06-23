import React, { useState, useEffect } from 'react';

const today = new Date().toLocaleDateString();

// Local roadmap data instead of importing from Roadmap component
const roadmapAchievements = [
  'Project Foundation - Complete setup with React, Vite, and Tailwind CSS',
  'Authentication System - Secure login with session management',
  'API Management - KuCoin integration with live price feeds',
  'Admin Management - Complete admin user management system',
  'Version Control - Automated version tracking and roadmap updates'
];

const roadmapDate = '2025-06-24';

const roadmapData = [
  {
    date: '6/23/2035',
    title: 'Project Foundation',
    status: 'completed',
    icon: '🚀',
    details: [
      '🚀 Project bootstrapped with React, Vite, and Tailwind CSS',
      '🔐 Secure API key manager with password hashing and encryption',
      '💾 Persistent password and API key storage (localStorage + encryption)',
      '🔑 API Manager: add, view, and delete API keys (KuCoin, Cryptometer, etc.)',
      '⚙️ Backend Flask server with user/session management and CORS',
      '📊 KuCoin price proxy endpoint (secure, uses stored API keys)',
      '💰 Frontend KucoinPrice component fetches live BTC/USDT price',
      '🔧 Debugged and fixed CORS, session, and FERNET_KEY issues',
      '🔄 Automated clearing and re-adding of API keys for encryption consistency',
      '🎨 CSS import order fixed for Tailwind and font imports',
      '✅ All servers run with correct environment and persistent keys',
      '🧪 End-to-end test: live price fetch from KuCoin with secure storage',
    ]
  },
  {
    date: today,
    title: 'V2 - Admin Management & Security',
    status: 'completed',
    icon: '👥',
    details: [
      '👥 Complete Admin Management System',
      '   • SuperAdmin can create, confirm, and delete admin users',
      '   • All verification codes sent to MasterAdmin email (seme@kryptostack.com)',
      '   • Admin confirmation flow with email verification',
      '   • Admin password reset functionality',
      '',
      '🔐 Enhanced Security & Authentication',
      '   • Comprehensive password change system for all user types',
      '   • Secure session management with proper cookie handling',
      '   • Email verification for all sensitive operations',
      '   • MasterAdmin email centralization for all admin operations',
      '',
      '📝 Comprehensive Logging System',
      '   • ActivityLog model for tracking all user actions',
      '   • Database and file-based logging with rotation',
      '   • Detailed audit trail for admin management operations',
      '   • Session tracking and security event logging',
      '',
      '🎨 Frontend Improvements',
      '   • Settings tab with Admin Management sub-tab',
      '   • Activity Logs viewer for SuperAdmin',
      '   • Tabbed interface for better organization',
      '   • Responsive design with modern UI components',
      '',
      '🧪 Testing & Quality Assurance',
      '   • Comprehensive test scripts for all flows',
      '   • Browser-based testing pages for real user scenarios',
      '   • Email sending verification and testing',
      '   • Session persistence testing across browsers',
      '',
      '📦 Version Control & Deployment',
      '   • Git v2 commit with all improvements preserved',
      '   • Previous version maintained in Git history',
      '   • Complete project backup and versioning',
      '   • Ready for production deployment',
    ]
  }
];

const menu = [
  { label: 'Roadmap', icon: '🚂' },
  { label: 'API Documentation', icon: '📚' },
  { label: 'System Architecture', icon: '🏗️' }
];

export default function Documentation() {
  const [activeTab, setActiveTab] = useState('Roadmap');
  const [expandedCard, setExpandedCard] = useState(null);

  const toggleCard = (index) => {
    setExpandedCard(expandedCard === index ? null : index);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Documentation Center</h1>
            <p className="text-gray-300">Comprehensive guides and project documentation</p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-semibold text-lg">📖</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
        <div className="flex border-b border-white/10">
          {menu.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(tab.label)}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === tab.label
                  ? 'bg-blue-600/20 text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Roadmap Tab */}
          {activeTab === 'Roadmap' && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2 text-white">🚂 ZmartTrading Development Journey</h2>
                <p className="text-gray-300 text-lg">Track our progress through the development timeline</p>
              </div>

              {/* Timeline */}
              <div className="relative">
                {/* Timeline Track */}
                <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-gray-600"></div>
                
                {/* Timeline Cards */}
                <div className="space-y-6">
                  {roadmapAchievements.map((achievement, index) => (
                    <div key={index} className="relative">
                      {/* Timeline Dot */}
                      <div className="absolute left-6 top-6 w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full border-4 border-gray-900 shadow-lg z-10"></div>
                      
                      {/* Card */}
                      <div className={`ml-16 transition-all duration-300 ease-in-out ${
                        expandedCard === index ? 'transform scale-105' : 'hover:transform hover:scale-102'
                      }`}>
                        <div 
                          className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:shadow-xl hover:border-blue-500/30 ${
                            expandedCard === index ? 'shadow-2xl border-blue-500/50 bg-white/10' : ''
                          }`}
                          onClick={() => toggleCard(index)}
                        >
                          {/* Card Header */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                <span className="text-2xl">🚀</span>
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-white">{achievement.split(' - ')[0]}</h3>
                                <p className="text-sm text-gray-400">{roadmapDate}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400">✅ Completed</span>
                              <button className="text-gray-400 hover:text-blue-400 transition-colors">
                                {expandedCard === index ? '▼' : '▶'}
                              </button>
                            </div>
                          </div>

                          {/* Card Content */}
                          {expandedCard === index && (
                            <div className="mt-6 pt-6 border-t border-white/10">
                              <div className="space-y-3">
                                <span className="text-blue-400 mt-1">•</span>
                                <span className="text-white font-medium">{achievement}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* End of Timeline */}
                <div className="ml-16 mt-8">
                  <div className="flex items-center space-x-4">
                    <div className="w-4 h-4 bg-gray-600 rounded-full border-4 border-gray-900"></div>
                    <div className="text-gray-400 italic">More milestones coming soon...</div>
                  </div>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl rounded-2xl p-6 text-center border border-white/10">
                  <div className="text-3xl font-bold text-white mb-2">{roadmapAchievements.length}</div>
                  <div className="text-gray-300">Milestones Completed</div>
                </div>
                <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 backdrop-blur-xl rounded-2xl p-6 text-center border border-white/10">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {roadmapAchievements.length}
                  </div>
                  <div className="text-gray-300">Successfully Delivered</div>
                </div>
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-2xl p-6 text-center border border-white/10">
                  <div className="text-3xl font-bold text-purple-400 mb-2">100%</div>
                  <div className="text-gray-300">On Track</div>
                </div>
              </div>
            </div>
          )}

          {/* API Documentation Tab */}
          {activeTab === 'API Documentation' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4">API Integration Guide</h3>
                <p className="text-gray-300 mb-6">
                  Learn how to integrate with our trading bot APIs and manage your API keys securely.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* KuCoin API */}
                <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-semibold">₿</span>
                    </div>
                    <h4 className="text-lg font-semibold text-white">KuCoin Futures API</h4>
                  </div>
                  <div className="space-y-3 text-gray-300">
                    <p>• Real-time price data for futures trading</p>
                    <p>• Secure API key management</p>
                    <p>• Automatic rate limiting and error handling</p>
                    <p>• Support for multiple trading pairs</p>
                  </div>
                </div>

                {/* Cryptometer API */}
                <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-semibold">📊</span>
                    </div>
                    <h4 className="text-lg font-semibold text-white">Cryptometer API</h4>
                  </div>
                  <div className="space-y-3 text-gray-300">
                    <p>• Market sentiment analysis</p>
                    <p>• Risk assessment metrics</p>
                    <p>• Historical data analysis</p>
                    <p>• 17+ endpoints for comprehensive data</p>
                  </div>
                </div>
              </div>

              {/* API Key Management */}
              <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                <h4 className="text-lg font-semibold text-white mb-4">API Key Management</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="text-white font-medium mb-2">Security Features</h5>
                    <ul className="space-y-2 text-gray-300">
                      <li>• AES-256 encryption for all stored keys</li>
                      <li>• Automatic key rotation support</li>
                      <li>• Role-based access control</li>
                      <li>• Audit logging for all operations</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-white font-medium mb-2">Best Practices</h5>
                    <ul className="space-y-2 text-gray-300">
                      <li>• Never share API keys publicly</li>
                      <li>• Use read-only keys when possible</li>
                      <li>• Regularly rotate your keys</li>
                      <li>• Monitor API usage and limits</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* System Architecture Tab */}
          {activeTab === 'System Architecture' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4">System Overview</h3>
                <p className="text-gray-300 mb-6">
                  Understanding the architecture and components of the ZmartTrading system.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Frontend */}
                <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-semibold">⚛️</span>
                    </div>
                    <h4 className="text-lg font-semibold text-white">Frontend</h4>
                  </div>
                  <div className="space-y-3 text-gray-300">
                    <p>• React 18 with Vite</p>
                    <p>• Tailwind CSS for styling</p>
                    <p>• Axios for API communication</p>
                    <p>• Responsive design</p>
                  </div>
                </div>

                {/* Backend */}
                <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-semibold">🐍</span>
                    </div>
                    <h4 className="text-lg font-semibold text-white">Backend</h4>
                  </div>
                  <div className="space-y-3 text-gray-300">
                    <p>• Flask web framework</p>
                    <p>• SQLite database</p>
                    <p>• JWT authentication</p>
                    <p>• CORS enabled</p>
                  </div>
                </div>

                {/* External APIs */}
                <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-semibold">🌐</span>
                    </div>
                    <h4 className="text-lg font-semibold text-white">External APIs</h4>
                  </div>
                  <div className="space-y-3 text-gray-300">
                    <p>• KuCoin Futures API</p>
                    <p>• Cryptometer API</p>
                    <p>• Email services</p>
                    <p>• Real-time data feeds</p>
                  </div>
                </div>
              </div>

              {/* Data Flow */}
              <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                <h4 className="text-lg font-semibold text-white mb-4">Data Flow Architecture</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">1</span>
                    </div>
                    <span className="text-gray-300">User authentication and session management</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">2</span>
                    </div>
                    <span className="text-gray-300">API key management and encryption</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">3</span>
                    </div>
                    <span className="text-gray-300">External API integration and data fetching</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">4</span>
                    </div>
                    <span className="text-gray-300">Real-time data processing and display</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 