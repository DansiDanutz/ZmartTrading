import React, { useState, useEffect } from 'react';

const Roadmap = () => {
  const [roadmapData, setRoadmapData] = useState({
    date: '2025-06-24',
    achievements: [            "✅ Version V4 - Version V4 -  & Frontend improvements & Backend enhancements & Configuration changes"]
  });
  const [loading, setLoading] = useState(true);

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
          date: '2025-06-24',
          achievements: [            "✅ Version V4 - Version V4 -  & Frontend improvements & Backend enhancements & Configuration changes"]
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const nextMilestones = [
    {
      title: 'KingFisher Integration',
      description: 'Liquidation analysis and toxic order flow detection',
      status: 'planned',
      priority: 'high',
      icon: '🎯'
    },
    {
      title: 'RiskMetric Scoring',
      description: 'Implement comprehensive risk assessment system',
      status: 'planned',
      priority: 'high',
      icon: '📊'
    },
    {
      title: 'Cryptometer API',
      description: 'Market sentiment and data analysis integration',
      status: 'planned',
      priority: 'medium',
      icon: '📈'
    },
    {
      title: '25-Point Scoring',
      description: 'Advanced trading decision algorithm',
      status: 'planned',
      priority: 'high',
      icon: '🧮'
    },
    {
      title: 'Auto Trading',
      description: 'Automated trade execution system',
      status: 'planned',
      priority: 'medium',
      icon: '🤖'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading roadmap...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
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
        
        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-xl p-4 border border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm font-medium">Completed</p>
                <p className="text-white text-2xl font-bold">{roadmapData.achievements.length}</p>
              </div>
              <span className="text-3xl">✅</span>
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-xl p-4 border border-blue-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm font-medium">In Progress</p>
                <p className="text-white text-2xl font-bold">3</p>
              </div>
              <span className="text-3xl">🔄</span>
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-xl p-4 border border-purple-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm font-medium">Planned</p>
                <p className="text-white text-2xl font-bold">{nextMilestones.length}</p>
              </div>
              <span className="text-3xl">📋</span>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Completed Achievements</h2>
            <p className="text-gray-400 text-sm">Last updated: {roadmapData.date}</p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-semibold">✓</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roadmapData.achievements.map((achievement, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-400 text-sm">✓</span>
              </div>
              <span className="text-gray-200 text-sm leading-relaxed">{achievement}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Next Milestones Section */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Upcoming Milestones</h2>
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-semibold">🎯</span>
          </div>
        </div>

        <div className="space-y-4">
          {nextMilestones.map((milestone, index) => (
            <div key={index} className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-4 border border-white/10 hover:border-blue-500/30 transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">{milestone.icon}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{milestone.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      milestone.priority === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {milestone.priority === 'high' ? 'High Priority' : 'Medium Priority'}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mb-3">{milestone.description}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <span className="text-blue-400 text-xs font-medium">Planned</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                      <span className="text-gray-400 text-xs">Q2 2025</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Visualization */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h2 className="text-xl font-semibold text-white mb-6">Development Timeline</h2>
        
        <div className="relative">
          {/* Timeline Track */}
          <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-green-500 via-blue-500 to-purple-600"></div>
          
          {/* Timeline Items */}
          <div className="space-y-6">
            <div className="relative">
              <div className="absolute left-6 top-4 w-4 h-4 bg-green-500 rounded-full border-4 border-gray-900 shadow-lg"></div>
              <div className="ml-16">
                <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-xl p-4 border border-green-500/30">
                  <h3 className="text-white font-semibold mb-1">Foundation Phase</h3>
                  <p className="text-gray-300 text-sm">Complete - All core infrastructure built</p>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute left-6 top-4 w-4 h-4 bg-blue-500 rounded-full border-4 border-gray-900 shadow-lg"></div>
              <div className="ml-16">
                <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-xl p-4 border border-blue-500/30">
                  <h3 className="text-white font-semibold mb-1">Integration Phase</h3>
                  <p className="text-gray-300 text-sm">In Progress - API integrations and scoring systems</p>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute left-6 top-4 w-4 h-4 bg-purple-500 rounded-full border-4 border-gray-900 shadow-lg"></div>
              <div className="ml-16">
                <div className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-xl p-4 border border-purple-500/30">
                  <h3 className="text-white font-semibold mb-1">Automation Phase</h3>
                  <p className="text-gray-300 text-sm">Planned - Full automated trading system</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Roadmap; 