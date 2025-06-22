import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Documentation from './components/Documentation';
import Settings from './components/Settings';
import Login from './components/Login';
import { ErrorBoundary } from 'react-error-boundary';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

function ErrorFallback({ error }) {
  return (
    <div role="alert" style={{ padding: '20px', color: 'red' }}>
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
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
      case 'documentation':
        return <Documentation />;
      case 'settings':
        return <Settings />;
      default:
        return <div className="p-8 text-xl">This page is under development.</div>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar setCurrentPage={setCurrentPage} />
        <main style={{ flex: 1, position: 'relative' }}>
          {/* Header with logout button */}
          <div className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-white capitalize">
              {currentPage}
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300 text-sm">
                Welcome, {user.name || user.email}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
          
          {/* Main content */}
          <div className="bg-gray-900 min-h-screen">
            {renderCurrentPage()}
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
} 