import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GlassCard from './GlassCard';

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
  const [fullKeyData, setFullKeyData] = useState({}); // Store full key data for SuperAdmin

  // Configure axios to include credentials
  const api = axios.create({
    baseURL: 'http://localhost:5000/api',
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
      // Reload the list to get the updated data
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
      // Reload the list to get the updated data
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
    return key.key; // This is already masked from backend
  };

  if (loading) {
    return (
      <GlassCard className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="mt-2">Loading API keys...</p>
        </div>
      </GlassCard>
    );
  }

  if (error && error.includes('log in')) {
    return (
      <GlassCard className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">API Key Manager</h2>
          <p className="text-red-500 mb-4">{error}</p>
          <p className="text-gray-400">Please log in to access the API Key Manager.</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">API Key Manager</h2>
          <p className="text-sm text-gray-400 mt-1">
            {userRole?.isSuperAdmin ? 'SuperAdmin - Full Access' : 
             userRole?.isAdmin ? 'Admin - View Only (Masked)' : 'User - No Access'}
          </p>
        </div>
        {userRole?.isSuperAdmin && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            {showAddForm ? 'Cancel' : 'Add API Key'}
          </button>
        )}
      </div>

      {/* Add New API Key Form - SuperAdmin Only */}
      {showAddForm && userRole?.isSuperAdmin && (
        <form onSubmit={handleAddKey} className="mb-8 p-4 bg-black/20 rounded border border-white/10">
          <h3 className="text-lg font-semibold mb-4">Add New API Key</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input
                type="text"
                value={newKey.name}
                onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                className="w-full p-2 rounded bg-black/20 border border-white/10"
                placeholder="e.g., KuCoin, Cryptometer"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">API Key *</label>
              <input
                type="text"
                value={newKey.key}
                onChange={(e) => setNewKey({ ...newKey, key: e.target.value })}
                className="w-full p-2 rounded bg-black/20 border border-white/10"
                placeholder="Your API key"
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
                placeholder="Your secret key (optional)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Passphrase</label>
              <input
                type="password"
                value={newKey.passphrase}
                onChange={(e) => setNewKey({ ...newKey, passphrase: e.target.value })}
                className="w-full p-2 rounded bg-black/20 border border-white/10"
                placeholder="Your passphrase (optional)"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Add API Key
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* API Keys List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Stored API Keys</h3>
        {apiKeys.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No API keys found.</p>
            {userRole?.isSuperAdmin && (
              <p className="text-sm mt-2">Click "Add API Key" to get started.</p>
            )}
          </div>
        ) : (
          apiKeys.map((key) => (
            <div
              key={key.id}
              className="p-4 rounded bg-black/20 border border-white/10"
            >
              {editingKey?.id === key.id ? (
                // Edit Form - Only for SuperAdmin
                <form onSubmit={handleEditKey} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Name</label>
                      <input
                        type="text"
                        value={editingKey.name}
                        onChange={(e) => setEditingKey({ ...editingKey, name: e.target.value })}
                        className="w-full p-2 rounded bg-black/20 border border-white/10"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">API Key</label>
                      <input
                        type="text"
                        value={editingKey.key}
                        onChange={(e) => setEditingKey({ ...editingKey, key: e.target.value })}
                        className="w-full p-2 rounded bg-black/20 border border-white/10"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Secret Key</label>
                      <input
                        type="password"
                        value={editingKey.secret || ''}
                        onChange={(e) => setEditingKey({ ...editingKey, secret: e.target.value })}
                        className="w-full p-2 rounded bg-black/20 border border-white/10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Passphrase</label>
                      <input
                        type="password"
                        value={editingKey.passphrase || ''}
                        onChange={(e) => setEditingKey({ ...editingKey, passphrase: e.target.value })}
                        className="w-full p-2 rounded bg-black/20 border border-white/10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingKey(null)}
                      className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                // Display Mode
                <div>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-lg">{key.name}</h4>
                        <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                          {key.has_secret ? 'With Secret' : 'Key Only'}
                        </span>
                        {key.has_passphrase && (
                          <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded">
                            With Passphrase
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mb-2">
                        API Key: <span className="font-mono">{getDisplayKey(key)}</span>
                        {userRole?.isSuperAdmin && !fullKeyData[key.id] && (
                          <button
                            onClick={() => handleViewFullKey(key.id)}
                            className="ml-2 text-blue-400 hover:text-blue-300 text-xs"
                          >
                            (View Full)
                          </button>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        Created: {formatDate(key.created_at)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {userRole?.isSuperAdmin && (
                        <>
                          <button
                            onClick={() => {
                              // For editing, we need to get the full key data first
                              if (!fullKeyData[key.id]) {
                                loadFullKeyData(key.id).then(() => {
                                  const fullData = fullKeyData[key.id];
                                  setEditingKey({
                                    id: key.id,
                                    name: key.name,
                                    key: fullData?.key || '',
                                    secret: fullData?.secret || '',
                                    passphrase: fullData?.passphrase || ''
                                  });
                                });
                              } else {
                                const fullData = fullKeyData[key.id];
                                setEditingKey({
                                  id: key.id,
                                  name: key.name,
                                  key: fullData?.key || '',
                                  secret: fullData?.secret || '',
                                  passphrase: fullData?.passphrase || ''
                                });
                              }
                            }}
                            className="text-blue-400 hover:text-blue-300 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteKey(key.id)}
                            className="text-red-500 hover:text-red-400 text-sm"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Permission Notice */}
      {!userRole?.isSuperAdmin && userRole?.isAdmin && (
        <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded">
          <p className="text-blue-300 text-sm">
            <strong>View Only Mode:</strong> You can view API keys (masked) but cannot add, edit, or delete them. 
            Only the SuperAdmin ({userRole?.email === 'seme@kryptostack.com' ? 'you' : 'seme@kryptostack.com'}) 
            has full access to manage API keys.
          </p>
        </div>
      )}

      {/* Security Notice */}
      <div className="mt-6 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded">
        <p className="text-yellow-300 text-sm">
          <strong>Security:</strong> API keys are encrypted in the database and never stored in plain text. 
          Only SuperAdmin can view full keys. All keys are stored locally and never committed to version control.
        </p>
      </div>
    </GlassCard>
  );
} 