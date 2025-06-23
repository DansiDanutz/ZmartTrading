import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Roadmap = () => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);

  // Accurate static versions based on actual Git history and achievements
  const staticVersions = [
    {
      version: 'V1',
      title: 'Project Foundation & Strategy Documentation',
      date: '2025-06-12',
      details: `🚀 **Project Foundation: Initial ZmartBot Strategy & Documentation Setup**
• Initial commit with complete ZmartBot trading strategy documentation
• Comprehensive PDF documentation: Cryptometer API reference, RiskMetric methodology, KuCoin integration guide
• Position management formulas and historical trades data structure
• Basic dashboard UI components and project structure
• All core strategy documents and reference materials established` 
    },
    {
      version: 'V2',
      title: 'Complete Authentication & Admin Management System',
      date: '2025-06-22',
      details: `🔐 **Major Authentication & Admin Management: Fully Tested & Stable**
• Complete user authentication system with secure login/logout flows
• Admin user management with role-based access control (admin/superadmin)
• Password reset functionality with email notifications (tested and working)
• Comprehensive admin settings panel with user management capabilities
• Session management with CSRF protection and secure cookie handling
• Extensive testing suite: 15+ test files covering all authentication flows
• Frontend/backend improvements with polished UI and responsive design
• All flows tested and stable - previous version preserved in Git history` 
    },
    {
      version: 'V3',
      title: 'API Management & Version Control System',
      date: '2025-06-23',
      details: `📊 **Complete API Management & Version Control: Production Ready**
• KuCoin API integration with live price feeds and real-time data
• API key management system with secure storage and validation
• Complete admin management system with user roles and permissions
• Version control automation with Git tag integration
• Roadmap UI with dynamic version cards and expandable details
• Comprehensive documentation system with automated updates
• Startup guides and version automation scripts for deployment
• Database management and API testing suite (20+ test files)
• All systems tested and production-ready` 
    },
    {
      version: 'V4',
      title: 'Roadmap Automation & UI Polish',
      date: '2025-06-24',
      details: `🎯 **Roadmap Automation & Professional UI Polish: Complete**
• Automated roadmap system with Git integration for version tracking
• Professional dark theme UI with green accent (#00FF94) design system
• Enhanced Roadmap component with expandable version cards and detailed explanations
• Super Admin version restore functionality in Settings tab
• Backend API enhancements with detailed version information
• Responsive sidebar navigation with active state indicators
• Complete version management system with restore capabilities
• All UI components polished and professional-grade
• Full integration of version control with user interface` 
    },
  ];

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        console.log('Fetching roadmap versions...');
        const response = await axios.get('http://localhost:5001/api/roadmap-versions', {
          withCredentials: true
        });
        console.log('Roadmap API response:', response.data);
        
        // Debug output for troubleshooting
        window._roadmapVersions = response.data.versions;
        
        if (response.data.success && response.data.versions) {
          // Use API data with fallback to static data for details
          const enhancedVersions = response.data.versions.map((v, i) => ({
            ...v,
            details: v.details || staticVersions[i]?.details || 'No details available.'
          }));
          setVersions(enhancedVersions);
        } else {
          console.log('Using static versions as fallback');
          setVersions(staticVersions);
        }
      } catch (err) {
        console.error('Error fetching roadmap versions:', err);
        setError('Failed to load roadmap data');
        // Fallback to static data
        setVersions(staticVersions);
      } finally {
        setLoading(false);
      }
    };
    fetchVersions();
  }, []);

  const toggleCard = (version) => {
    setExpandedCard(expandedCard === version ? null : version);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Project Roadmap</h1>
              <p className="text-gray-300">Track our progress and future milestones</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-semibold text-lg">🚀</span>
            </div>
          </div>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            <span className="ml-3 text-gray-300">Loading roadmap...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Project Roadmap</h1>
              <p className="text-gray-300">Track our progress and future milestones</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-semibold text-lg">🚀</span>
            </div>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <p className="text-red-400">{error}</p>
            <p className="text-gray-400 text-sm mt-2">Using fallback data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Project Roadmap</h1>
            <p className="text-gray-300">Track our progress and future milestones</p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-semibold text-lg">🚀</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {versions.map((version, index) => (
            <div 
              key={version.version}
              className={`bg-white/5 border border-white/10 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:bg-white/10 hover:border-green-500/30 ${
                expandedCard === version.version ? 'ring-2 ring-green-500/50 bg-white/10 border-green-500/50 shadow-lg' : ''
              }`}
              onClick={() => toggleCard(version.version)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">{version.version}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{version.title}</h3>
                    <p className="text-xs text-gray-400">{version.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400">
                    ✅ Complete
                  </span>
                  <span className="text-gray-400 text-xs transition-transform duration-200">
                    {expandedCard === version.version ? '▼' : '▶'}
                  </span>
                </div>
              </div>
              
              <div className="text-gray-300 text-sm">
                {expandedCard === version.version ? (
                  <div className="space-y-3">
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                        {version.details.split('\n').map((line, i) => (
                          <div key={i} className="mb-2">
                            {line.startsWith('•') ? (
                              <span className="text-green-400">•</span> + line.substring(1)
                            ) : line.startsWith('🚀') || line.startsWith('🔐') || line.startsWith('📊') || line.startsWith('💰') || line.startsWith('🎯') ? (
                              <span className="font-semibold text-green-400">{line}</span>
                            ) : (
                              line
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <button 
                      className="text-green-400 hover:text-green-300 text-xs font-medium flex items-center gap-1 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedCard(null);
                      }}
                    >
                      <span>▼</span> Show less
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-gray-300 line-clamp-3 leading-relaxed">
                      {version.details.split('\n')[0].replace(/^[🚀🔐📊💰🎯]\s*\*\*/, '').replace(/\*\*$/, '')}
                    </p>
                    <button 
                      className="text-green-400 hover:text-green-300 text-xs font-medium flex items-center gap-1 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCard(version.version);
                      }}
                    >
                      <span>▶</span> Read more
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
          <div className="flex items-center gap-3">
            <span className="text-green-400 text-lg">💡</span>
            <div>
              <h4 className="text-green-400 font-semibold">Tip</h4>
              <p className="text-gray-300 text-sm">Click on any version card to see detailed achievements and milestones for that release.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Roadmap; 