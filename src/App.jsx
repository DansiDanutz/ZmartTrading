import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Documentation from './components/Documentation';
import Settings from './components/Settings';
import Login from './components/Login';
import APIManager from './components/APIManager';
import Symbols from './components/Symbols';
import { ErrorBoundary } from 'react-error-boundary';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

function ErrorFallback({ error }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-gray-900 to-red-900 flex items-center justify-center p-8">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full border border-red-500/20">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
          <p className="text-gray-300 mb-4">We encountered an unexpected error</p>
          <div className="bg-red-900/50 rounded-lg p-4 text-left">
            <pre className="text-red-200 text-sm overflow-auto">{error.message}</pre>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/session`, { withCredentials: true });
      setUser(response.data.user);
    } catch (error) {
      console.log('User not authenticated');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/logout`, {}, { withCredentials: true });
      setUser(null);
      setCurrentPage('dashboard');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'quick-trade':
        return (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Quick Trade</h3>
              <p className="text-gray-400">This feature is under development...</p>
            </div>
          </div>
        );
      case 'symbols':
        return <Symbols />;
      case 'roadmap':
        return <Documentation />;
      case 'settings':
        return <Settings />;
      case 'api':
        return <APIManager />;
      default:
        return (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Page Under Development</h3>
              <p className="text-gray-400">This feature is coming soon...</p>
            </div>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-gray-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin mx-auto" style={{ animationDelay: '0.5s' }}></div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading ZmartTrading</h2>
          <p className="text-gray-300">Initializing your trading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
        <Sidebar setCurrentPage={setCurrentPage} currentPage={currentPage} />
        <main className="flex-1 flex flex-col">
          {/* Enhanced Header */}
          <header className="bg-white/5 backdrop-blur-lg border-b border-white/10 px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white capitalize">
                    {currentPage === 'dashboard' ? 'Trading Dashboard' : 
                     currentPage === 'quick-trade' ? 'Quick Trade' :
                     currentPage === 'symbols' ? 'Symbols Management' :
                     currentPage === 'roadmap' ? 'Project Roadmap' :
                     currentPage === 'settings' ? 'System Settings' :
                     currentPage === 'api' ? 'API Management' : currentPage}
                  </h1>
                  <p className="text-gray-400 text-sm">
                    {currentPage === 'dashboard' ? 'Monitor your trading performance' :
                     currentPage === 'quick-trade' ? 'Fast trading interface (Under Development)' :
                     currentPage === 'symbols' ? 'Manage trading symbols and market data' :
                     currentPage === 'roadmap' ? 'Track development progress' :
                     currentPage === 'settings' ? 'Configure system preferences' :
                     currentPage === 'api' ? 'Manage API keys and integrations' : 'Page overview'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-white font-medium">{user.name || user.email}</p>
                  <p className="text-gray-400 text-sm">
                    {user.is_superadmin ? 'Super Admin' : user.is_admin ? 'Administrator' : 'User'}
                  </p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {(user.name || user.email).charAt(0).toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-red-500/20 hover:border-red-500/40"
                >
                  <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          </header>
          
          {/* Main Content */}
          <div className="flex-1 p-6">
            {renderCurrentPage()}
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
} 