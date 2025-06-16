import React, { useState, useEffect } from 'react';
import { apiStorage } from '../services/apiStorage';
import GlassCard from './GlassCard';

export default function APIManager() {
  const [apiKeys, setApiKeys] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(apiStorage.isAuthenticated);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showResetInfo, setShowResetInfo] = useState(false);
  const [newKey, setNewKey] = useState({
    name: '',
    key: '',
    secret: '',
    passphrase: ''
  });

  // Always check authentication state on mount
  useEffect(() => {
    setIsAuthenticated(apiStorage.isAuthenticated);
  }, []);

  // Clear error when user types
  useEffect(() => {
    if (error && password) setError('');
  }, [password]);

  const handleAuthenticate = (e) => {
    e.preventDefault();
    if (!apiStorage.passwordHash) {
      // First time setup
      apiStorage.initialize(password);
      setIsAuthenticated(true);
      loadAPIKeys();
    } else {
      // Unlock
      if (!apiStorage.verifyPassword(password)) {
        setError('Incorrect password. Please try again.');
        return;
      }
      setIsAuthenticated(true);
      loadAPIKeys();
    }
    setPassword('');
  };

  const loadAPIKeys = () => {
    try {
      const keys = apiStorage.getAPIKeys();
      setApiKeys(keys);
    } catch (err) {
      setError(err.message);
      if (err.message.includes('Not authenticated')) {
        setIsAuthenticated(false);
      }
    }
  };

  const handleAddKey = (e) => {
    e.preventDefault();
    try {
      const updatedKeys = [...apiKeys, newKey];
      apiStorage.saveAPIKeys(updatedKeys);
      setApiKeys(updatedKeys);
      setNewKey({ name: '', key: '', secret: '', passphrase: '' });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteKey = (index) => {
    try {
      const updatedKeys = apiKeys.filter((_, i) => i !== index);
      apiStorage.saveAPIKeys(updatedKeys);
      setApiKeys(updatedKeys);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    apiStorage.clear();
    setIsAuthenticated(false);
    setApiKeys([]);
    setPassword('');
  };

  // UI logic
  const showSetPassword = !apiStorage.passwordHash;
  const showUnlock = !!apiStorage.passwordHash && !isAuthenticated;

  if (showSetPassword || showUnlock || !isAuthenticated) {
    return (
      <GlassCard className="p-6">
        <h2 className="text-2xl font-bold mb-4">API Key Manager</h2>
        <form onSubmit={handleAuthenticate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setShowResetInfo(false); }}
              className="w-full p-2 rounded bg-black/20 border border-white/10"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
          >
            {showSetPassword ? 'Set Password' : 'Unlock'}
          </button>
          <div className="text-right mt-2">
            <button
              type="button"
              className="text-blue-400 underline text-sm"
              onClick={() => setShowResetInfo(v => !v)}
            >
              Forgot Password?
            </button>
          </div>
          {showResetInfo && (
            <div className="mt-2 text-sm text-gray-300">
              To reset your password, contact the master account: <b>seme@kryptostack.com</b>
              <button
                className="ml-2 px-2 py-1 bg-blue-500 text-white rounded"
                type="button"
                onClick={() => window.open('mailto:seme@kryptostack.com')}
              >
                Email Now
              </button>
            </div>
          )}
        </form>
      </GlassCard>
    );
  }

  // If authenticated, show the API key manager
  return (
    <GlassCard className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">API Key Manager</h2>
        <button
          onClick={handleLogout}
          className="text-red-500 hover:text-red-600 text-sm"
        >
          Logout
        </button>
      </div>
      {/* Add New API Key Form */}
      <form onSubmit={handleAddKey} className="mb-8 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={newKey.name}
              onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
              className="w-full p-2 rounded bg-black/20 border border-white/10"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">API Key</label>
            <input
              type="text"
              value={newKey.key}
              onChange={(e) => setNewKey({ ...newKey, key: e.target.value })}
              className="w-full p-2 rounded bg-black/20 border border-white/10"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Secret Key</label>
            <input
              type="password"
              value={newKey.secret}
              onChange={(e) => setNewKey({ ...newKey, secret: e.target.value })}
              className="w-full p-2 rounded bg-black/20 border border-white/10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Passphrase</label>
            <input
              type="password"
              value={newKey.passphrase}
              onChange={(e) => setNewKey({ ...newKey, passphrase: e.target.value })}
              className="w-full p-2 rounded bg-black/20 border border-white/10"
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
        >
          Add API Key
        </button>
      </form>
      {/* API Keys List */}
      <div className="space-y-4">
        {apiKeys.map((key, index) => (
          <div
            key={index}
            className="p-4 rounded bg-black/20 border border-white/10"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">{key.name}</h3>
                <p className="text-sm text-gray-400">API Key: {key.key.substring(0, 8)}...</p>
              </div>
              <button
                onClick={() => handleDeleteKey(index)}
                className="text-red-500 hover:text-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
    </GlassCard>
  );
} 