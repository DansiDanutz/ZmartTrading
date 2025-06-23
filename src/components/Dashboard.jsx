import MetricCard from './MetricCard';
import APIManager from './APIManager';
import KucoinPrice from './KucoinPrice';
import React from 'react';

const metrics = [
  { 
    label: 'TOTAL PROFIT', 
    value: '$24,500', 
    change: '+12.5%',
    changeType: 'positive',
    icon: '💰',
    color: 'green',
    description: 'Total profit from all trades'
  },
  { 
    label: 'TOTAL TRADES', 
    value: '1,258', 
    change: '+8.2%',
    changeType: 'positive',
    icon: '📊',
    color: 'blue',
    description: 'Total number of trades executed'
  },
  { 
    label: 'WIN RATE', 
    value: '67.2%', 
    change: '+2.1%',
    changeType: 'positive',
    icon: '🎯',
    color: 'orange',
    description: 'Won: 845 / Lost: 413'
  },
  { 
    label: 'PROFIT RATIO', 
    value: '2.05', 
    change: '+0.15',
    changeType: 'positive',
    icon: '⚖️',
    color: 'blue',
    description: 'Average profit per trade'
  },
  { 
    label: 'ACTIVE VAULTS', 
    value: '4', 
    change: '+1',
    changeType: 'positive',
    icon: '🔒',
    color: 'green',
    description: 'Currently active trading vaults'
  },
  { 
    label: 'TOTAL INVESTED', 
    value: '$1,072K', 
    change: '+$45K',
    changeType: 'positive',
    icon: '💎',
    color: 'orange',
    description: 'Total money invested by users'
  },
];

const recentActivity = [
  { action: 'Trade Executed', symbol: 'BTC/USDT', profit: '+$1,250', time: '2 min ago', type: 'success' },
  { action: 'Vault Created', symbol: 'ETH/USDT', profit: 'New', time: '15 min ago', type: 'info' },
  { action: 'Trade Failed', symbol: 'SOL/USDT', profit: '-$320', time: '1 hour ago', type: 'error' },
  { action: 'Profit Withdrawn', symbol: 'User', profit: '+$5,000', time: '2 hours ago', type: 'success' },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Trading Dashboard</h1>
            <p className="text-gray-300">Monitor your trading performance and market insights</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-400">Last Updated</p>
              <p className="text-white font-medium">{new Date().toLocaleTimeString()}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📈</span>
            </div>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-xl p-4 border border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm font-medium">Today's Profit</p>
                <p className="text-white text-2xl font-bold">+$2,450</p>
              </div>
              <span className="text-3xl">📈</span>
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-xl p-4 border border-blue-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm font-medium">Active Trades</p>
                <p className="text-white text-2xl font-bold">12</p>
              </div>
              <span className="text-3xl">⚡</span>
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-xl p-4 border border-purple-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm font-medium">Success Rate</p>
                <p className="text-white text-2xl font-bold">67.2%</p>
              </div>
              <span className="text-3xl">🎯</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Price Chart */}
        <div className="lg:col-span-2">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 h-96">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Market Overview</h2>
              <div className="flex items-center gap-2">
                <span className="text-green-400 text-sm">Live</span>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>
            <KucoinPrice />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'success' ? 'bg-green-400' :
                  activity.type === 'error' ? 'bg-red-400' : 'bg-blue-400'
                }`}></div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{activity.action}</p>
                  <p className="text-gray-400 text-xs">{activity.symbol} • {activity.time}</p>
                </div>
                <span className={`text-sm font-semibold ${
                  activity.profit.startsWith('+') ? 'text-green-400' :
                  activity.profit.startsWith('-') ? 'text-red-400' : 'text-blue-400'
                }`}>
                  {activity.profit}
                </span>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
            View All Activity →
          </button>
        </div>
      </div>

      {/* API Manager Section */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h2 className="text-xl font-semibold text-white mb-6">API Management</h2>
        <APIManager />
      </div>
    </div>
  );
} 