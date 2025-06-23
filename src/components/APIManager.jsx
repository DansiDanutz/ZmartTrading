import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function APIManager() {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newKey, setNewKey] = useState({
    name: '',
    key: '',
    secret: '',
    passphrase: ''
  });
  const [editingKey, setEditingKey] = useState(null);
  const [fullKeyData, setFullKeyData] = useState({});

  const api = axios.create({
    baseURL: 'http://localhost:5001/api',
    withCredentials: true
  });

  useEffect(() => {
    loadAPIKeys();
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const response = await api.get('/session');
      if (response.data.user) {
        setUserRole({
          isAdmin: response.data.user.is_admin,
          isSuperAdmin: response.data.user.is_superadmin,
          email: response.data.user.email
        });
      }
    } catch (err) {
      console.error('Error checking user role:', err);
    }
  };

  const loadAPIKeys = async () => {
    try {
      setLoading(true);
      const response = await api.get('/apikeys');
      setApiKeys(response.data.api_keys || []);
      setError('');
    } catch (err) {
      console.error('Error loading API keys:', err);
      if (err.response?.status === 401) {
        setError('Please log in to view API keys');
      } else if (err.response?.status === 403) {
        setError('Admin access required to view API keys');
      } else {
        setError('Failed to load API keys');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadFullKeyData = async (keyId) => {
    if (!userRole?.isSuperAdmin) return;
    
    try {
      const response = await api.get(`/apikeys/${keyId}/decrypt`);
      setFullKeyData(prev => ({
        ...prev,
        [keyId]: response.data
      }));
    } catch (err) {
      console.error('Error loading full key data:', err);
      setError('Failed to load full key data');
    }
  };

  const handleAddKey = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/apikeys', newKey);
      setNewKey({ name: '', key: '', secret: '', passphrase: '' });
      setShowAddForm(false);
      setError('');
      await loadAPIKeys();
    } catch (err) {
      console.error('Error adding API key:', err);
      setError(err.response?.data?.error || 'Failed to add API key');
    }
  };

  const handleDeleteKey = async (keyId) => {
    if (!confirm('Are you sure you want to delete this API key?')) {
      return;
    }
    
    try {
      await api.delete(`/apikeys/${keyId}`);
      setApiKeys(prev => prev.filter(key => key.id !== keyId));
      setError('');
    } catch (err) {
      console.error('Error deleting API key:', err);
      setError(err.response?.data?.error || 'Failed to delete API key');
    }
  };

  const handleEditKey = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/apikeys/${editingKey.id}`, editingKey);
      setEditingKey(null);
      setError('');
      await loadAPIKeys();
    } catch (err) {
      console.error('Error updating API key:', err);
      setError(err.response?.data?.error || 'Failed to update API key');
    }
  };

  const handleViewFullKey = async (keyId) => {
    if (!userRole?.isSuperAdmin) return;
    
    if (!fullKeyData[keyId]) {
      await loadFullKeyData(keyId);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getDisplayKey = (key) => {
    if (userRole?.isSuperAdmin && fullKeyData[key.id]) {
      return fullKeyData[key.id].key;
    }
    return key.key;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading API keys...</p>
        </div>
      </div>
    );
  }

  if (error && error.includes('log in')) {
    return (
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 text-center">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">API Key Manager</h2>
        <p className="text-red-400 mb-4">{error}</p>
        <p className="text-gray-400">Please log in to access the API Key Manager.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">API Key Manager</h2>
          <p className="text-gray-400 mt-1">
            {userRole?.isSuperAdmin ? 'SuperAdmin - Full Access' : 
             userRole?.isAdmin ? 'Admin - View Only (Masked)' : 'User - No Access'}
          </p>
        </div>
        {userRole?.isSuperAdmin && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {showAddForm ? 'Cancel' : 'Add API Key'}
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-red-300">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* Add New API Key Form - SuperAdmin Only */}
      {showAddForm && userRole?.isSuperAdmin && (
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-6">Add New API Key</h3>
          <form onSubmit={handleAddKey} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name *</label>
                <input
                  type="text"
                  value={newKey.name}
                  onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., KuCoin, Cryptometer"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">API Key *</label>
                <input
                  type="text"
                  value={newKey.key}
                  onChange={(e) => setNewKey({ ...newKey, key: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter API key"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Secret *</label>
                <input
                  type="password"
                  value={newKey.secret}
                  onChange={(e) => setNewKey({ ...newKey, secret: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter secret key"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Passphrase</label>
                <input
                  type="password"
                  value={newKey.passphrase}
                  onChange={(e) => setNewKey({ ...newKey, passphrase: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter passphrase (optional)"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200"
              >
                Add API Key
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 px-6 py-3 rounded-xl font-medium transition-all duration-200 border border-gray-500/20"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* API Keys Table */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-xl font-semibold text-white">API Keys ({apiKeys.length})</h3>
        </div>
        
        {apiKeys.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <p className="text-gray-400">No API keys found</p>
            {userRole?.isSuperAdmin && (
              <p className="text-gray-500 text-sm mt-2">Click "Add API Key" to get started</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">API Key</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {apiKeys.map((key) => (
                  <tr key={key.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm font-bold">🔑</span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{key.name}</p>
                          <p className="text-gray-400 text-sm">ID: {key.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <code className="text-sm bg-white/10 px-2 py-1 rounded text-gray-300 font-mono">
                          {getDisplayKey(key)}
                        </code>
                        {userRole?.isSuperAdmin && !fullKeyData[key.id] && (
                          <button
                            onClick={() => handleViewFullKey(key.id)}
                            className="text-blue-400 hover:text-blue-300 text-sm"
                          >
                            View Full
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {formatDate(key.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {userRole?.isSuperAdmin && (
                          <>
                            <button
                              onClick={() => setEditingKey(key)}
                              className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-blue-500/10 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteKey(key.id)}
                              className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingKey && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 max-w-md w-full">
            <h3 className="text-xl font-semibold text-white mb-6">Edit API Key</h3>
            <form onSubmit={handleEditKey} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={editingKey.name}
                  onChange={(e) => setEditingKey({ ...editingKey, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => setEditingKey(null)}
                  className="flex-1 bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 px-4 py-3 rounded-xl font-medium transition-all duration-200 border border-gray-500/20"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 