import React, { useState } from 'react';

const today = new Date().toLocaleDateString();

const roadmapData = [
  {
    date: '6/23/2035',
    title: 'Project Foundation',
    status: 'completed',
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
  { label: 'Roadmap' },
  // Add more tabs here as needed
];

export default function Documentation() {
  const [activeTab, setActiveTab] = useState('Roadmap');
  const [expandedCard, setExpandedCard] = useState(null);

  const toggleCard = (index) => {
    setExpandedCard(expandedCard === index ? null : index);
  };

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
        <div className="space-y-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2 text-neon-green">🚂 ZmartTrading Development Journey</h2>
            <p className="text-muted-foreground text-lg">Track our progress through the development timeline</p>
          </div>

          {/* Train Timeline */}
          <div className="relative">
            {/* Train Track */}
            <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-neon-green via-neon-green to-gray-600"></div>
            
            {/* Timeline Cards */}
            <div className="space-y-6">
              {roadmapData.map((milestone, index) => (
                <div key={index} className="relative">
                  {/* Train Station */}
                  <div className="absolute left-6 top-6 w-4 h-4 bg-neon-green rounded-full border-4 border-background shadow-lg z-10"></div>
                  
                  {/* Card */}
                  <div className={`ml-16 transition-all duration-300 ease-in-out ${
                    expandedCard === index ? 'transform scale-105' : 'hover:transform hover:scale-102'
                  }`}>
                    <div 
                      className={`bg-card border border-border rounded-lg p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-neon-green/50 ${
                        expandedCard === index ? 'shadow-xl border-neon-green' : ''
                      }`}
                      onClick={() => toggleCard(index)}
                    >
                      {/* Card Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className={`w-3 h-3 rounded-full ${
                            milestone.status === 'completed' ? 'bg-green-500' : 
                            milestone.status === 'in-progress' ? 'bg-yellow-500' : 'bg-gray-500'
                          }`}></div>
                          <div>
                            <h3 className="text-xl font-bold text-foreground">{milestone.title}</h3>
                            <p className="text-sm text-muted-foreground">{milestone.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            milestone.status === 'completed' ? 'bg-green-500/20 text-green-400' : 
                            milestone.status === 'in-progress' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {milestone.status === 'completed' ? '✅ Completed' : 
                             milestone.status === 'in-progress' ? '🔄 In Progress' : '⏳ Planned'}
                          </span>
                          <button className="text-muted-foreground hover:text-neon-green transition-colors">
                            {expandedCard === index ? '▼' : '▶'}
                          </button>
                        </div>
                      </div>

                      {/* Card Content */}
                      {expandedCard === index && (
                        <div className="mt-4 pt-4 border-t border-border">
                          <div className="space-y-3">
                            {milestone.details.map((detail, detailIndex) => (
                              <div key={detailIndex} className="flex items-start space-x-3">
                                {detail.startsWith('   •') ? (
                                  <>
                                    <span className="text-muted-foreground mt-1">└─</span>
                                    <span className="text-foreground">{detail.substring(4)}</span>
                                  </>
                                ) : detail === '' ? (
                                  <div className="h-2"></div>
                                ) : (
                                  <>
                                    <span className="text-neon-green mt-1">•</span>
                                    <span className="text-foreground font-medium">{detail}</span>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* End of Track */}
            <div className="ml-16 mt-8">
              <div className="flex items-center space-x-4">
                <div className="w-4 h-4 bg-gray-600 rounded-full border-4 border-background"></div>
                <div className="text-muted-foreground italic">More milestones coming soon...</div>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-neon-green mb-2">{roadmapData.length}</div>
              <div className="text-muted-foreground">Milestones Completed</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-green-500 mb-2">
                {roadmapData.filter(m => m.status === 'completed').length}
              </div>
              <div className="text-muted-foreground">Successfully Delivered</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-blue-500 mb-2">V2</div>
              <div className="text-muted-foreground">Current Version</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 