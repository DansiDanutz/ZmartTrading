import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('password');

  // Password change states
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordCode, setPasswordCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [codeSent, setCodeSent] = useState(false);

  // Admin creation states
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminName, setAdminName] = useState('');
  const [tempPassword, setTempPassword] = useState('');

  // Admin confirmation states
  const [showConfirmAdmin, setShowConfirmAdmin] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [selectedAdminEmail, setSelectedAdminEmail] = useState('');

  // Admin password reset states
  const [showAdminReset, setShowAdminReset] = useState(false);
  const [resetAdminEmail, setResetAdminEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resetCodeSent, setResetCodeSent] = useState(false);

  // Activity logs states
  const [logsPage, setLogsPage] = useState(1);
  const [logsPerPage] = useState(20);
  const [logsPagination, setLogsPagination] = useState({});

  useEffect(() => {
    fetchUser();
    if (activeTab === 'admins') {
      fetchAdmins();
    } else if (activeTab === 'logs') {
      fetchActivityLogs();
    }
  }, [activeTab]);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/session`, { withCredentials: true });
      setUser(response.data.user);
    } catch (error) {
      console.error('Error fetching user:', error);
      setError('Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/list-admins`, { withCredentials: true });
      setAdmins(response.data);
    } catch (error) {
      console.error('Error fetching admins:', error);
      showMessage('Failed to fetch admins', true);
    }
  };

  const fetchActivityLogs = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/auth/activity-logs?page=${logsPage}&per_page=${logsPerPage}`, 
        { withCredentials: true }
      );
      setActivityLogs(response.data.logs);
      setLogsPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      showMessage('Failed to fetch activity logs', true);
    }
  };

  const showMessage = (msg, isError = false) => {
    if (isError) {
      setError(msg);
      setMessage('');
    } else {
      setMessage(msg);
      setError('');
    }
    setTimeout(() => {
      setMessage('');
      setError('');
    }, 5000);
  };

  // Password Change Functions
  const requestPasswordChange = async () => {
    try {
      await axios.post(`${API_BASE_URL}/auth/request-password-change`, {}, { withCredentials: true });
      setCodeSent(true);
      showMessage('Verification code sent to MasterAdmin email (seme@kryptostack.com)');
    } catch (error) {
      showMessage(error.response?.data?.error || 'Failed to send verification code', true);
    }
  };

  const changePassword = async () => {
    if (newPassword !== confirmPassword) {
      showMessage('Passwords do not match', true);
      return;
    }

    if (newPassword.length < 6) {
      showMessage('Password must be at least 6 characters', true);
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/auth/change-password`, {
        code: passwordCode,
        new_password: newPassword
      }, { withCredentials: true });
      
      showMessage('Password changed successfully');
      setShowPasswordChange(false);
      setPasswordCode('');
      setNewPassword('');
      setConfirmPassword('');
      setCodeSent(false);
    } catch (error) {
      showMessage(error.response?.data?.error || 'Failed to change password', true);
    }
  };

  // Admin Creation Functions
  const createAdmin = async () => {
    if (!adminEmail || !adminName || !tempPassword) {
      showMessage('All fields are required', true);
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/auth/create-admin`, {
        email: adminEmail,
        name: adminName,
        temp_password: tempPassword
      }, { withCredentials: true });
      
      showMessage('Admin created. Confirmation code sent to MasterAdmin email (seme@kryptostack.com).');
      setShowCreateAdmin(false);
      setAdminEmail('');
      setAdminName('');
      setTempPassword('');
      fetchAdmins();
    } catch (error) {
      showMessage(error.response?.data?.error || 'Failed to create admin', true);
    }
  };

  // Admin Confirmation Functions
  const confirmAdmin = async () => {
    if (!confirmationCode || !selectedAdminEmail) {
      showMessage('Code and admin email are required', true);
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/auth/confirm-admin`, {
        code: confirmationCode,
        admin_email: selectedAdminEmail
      }, { withCredentials: true });
      
      showMessage('Admin account activated successfully');
      setShowConfirmAdmin(false);
      setConfirmationCode('');
      setSelectedAdminEmail('');
      fetchAdmins();
    } catch (error) {
      showMessage(error.response?.data?.error || 'Failed to confirm admin', true);
    }
  };

  // Admin Password Reset Functions
  const requestAdminReset = async () => {
    if (!resetAdminEmail) {
      showMessage('Admin email is required', true);
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/auth/request-reset-code`, {
        email: resetAdminEmail
      }, { withCredentials: true });
      setResetCodeSent(true);
      showMessage('Reset code sent to MasterAdmin email (seme@kryptostack.com)');
    } catch (error) {
      showMessage(error.response?.data?.error || 'Failed to send reset code', true);
    }
  };

  const resetAdminPassword = async () => {
    if (resetNewPassword !== resetConfirmPassword) {
      showMessage('Passwords do not match', true);
      return;
    }

    if (resetNewPassword.length < 6) {
      showMessage('Password must be at least 6 characters', true);
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/auth/verify-reset-code`, {
        email: resetAdminEmail,
        code: resetCode,
        new_password: resetNewPassword
      }, { withCredentials: true });
      
      showMessage('Admin password reset successfully');
      setShowAdminReset(false);
      setResetAdminEmail('');
      setResetCode('');
      setResetNewPassword('');
      setResetConfirmPassword('');
      setResetCodeSent(false);
    } catch (error) {
      showMessage(error.response?.data?.error || 'Failed to reset admin password', true);
    }
  };

  const deleteAdmin = async (adminId) => {
    if (!confirm('Are you sure you want to delete this admin?')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/auth/delete-admin/${adminId}`, { withCredentials: true });
      showMessage('Admin deleted successfully');
      fetchAdmins();
    } catch (error) {
      showMessage(error.response?.data?.error || 'Failed to delete admin', true);
    }
  };

  const tabs = [
    { id: 'password', label: 'Password Change', icon: '🔐' },
    { id: 'admins', label: 'Admin Management', icon: '👥' },
    { id: 'logs', label: 'Activity Logs', icon: '📋' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading settings...</p>
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
            <h1 className="text-3xl font-bold text-white mb-2">System Settings</h1>
            <p className="text-gray-300">Manage system configuration and user access</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-white font-medium">{user?.name || user?.email}</p>
              <p className="text-gray-400 text-sm">
                {user?.is_superadmin ? 'Super Admin' : user?.is_admin ? 'Administrator' : 'User'}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-semibold text-lg">⚙️</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 text-green-300">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {message}
          </div>
        </div>
      )}
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

      {/* Tabs */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
        <div className="flex border-b border-white/10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === tab.id
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
          {/* Password Change Tab */}
          {activeTab === 'password' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4">Change Master Admin Password</h3>
                <p className="text-gray-300 mb-6">
                  Change the password for the Master Admin account (seme@kryptostack.com). 
                  A verification code will be sent to the Master Admin email.
                </p>
                
                {!showPasswordChange ? (
                  <button
                    onClick={() => setShowPasswordChange(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200"
                  >
                    Change Password
                  </button>
                ) : (
                  <div className="space-y-4">
                    {!codeSent ? (
                      <button
                        onClick={requestPasswordChange}
                        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200"
                      >
                        Send Verification Code
                      </button>
                    ) : (
                      <form onSubmit={(e) => { e.preventDefault(); changePassword(); }} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Verification Code</label>
                          <input
                            type="text"
                            value={passwordCode}
                            onChange={(e) => setPasswordCode(e.target.value)}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter verification code"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter new password"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Confirm new password"
                            required
                          />
                        </div>
                        <div className="flex gap-4">
                          <button
                            type="submit"
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200"
                          >
                            Change Password
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowPasswordChange(false)}
                            className="bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 px-6 py-3 rounded-xl font-medium transition-all duration-200 border border-gray-500/20"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Admin Management Tab */}
          {activeTab === 'admins' && (
            <div className="space-y-6">
              {/* Create Admin Section */}
              <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4">Create New Admin</h3>
                <p className="text-gray-300 mb-6">
                  Create a new administrator account. The admin will need to be confirmed via email.
                </p>
                
                {!showCreateAdmin ? (
                  <button
                    onClick={() => setShowCreateAdmin(true)}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200"
                  >
                    Create Admin
                  </button>
                ) : (
                  <form onSubmit={(e) => { e.preventDefault(); createAdmin(); }} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                        <input
                          type="email"
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="admin@example.com"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Name *</label>
                        <input
                          type="text"
                          value={adminName}
                          onChange={(e) => setAdminName(e.target.value)}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Admin Name"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Temporary Password *</label>
                      <input
                        type="password"
                        value={tempPassword}
                        onChange={(e) => setTempPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Temporary password"
                        required
                      />
                    </div>
                    <div className="flex gap-4">
                      <button
                        type="submit"
                        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200"
                      >
                        Create Admin
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCreateAdmin(false)}
                        className="bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 px-6 py-3 rounded-xl font-medium transition-all duration-200 border border-gray-500/20"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Confirm Admin Section */}
              <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4">Confirm Admin Account</h3>
                <p className="text-gray-300 mb-6">
                  Activate a pending admin account using the confirmation code sent to MasterAdmin email.
                </p>
                
                {!showConfirmAdmin ? (
                  <button
                    onClick={() => setShowConfirmAdmin(true)}
                    className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200"
                  >
                    Confirm Admin
                  </button>
                ) : (
                  <form onSubmit={(e) => { e.preventDefault(); confirmAdmin(); }} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Admin Email *</label>
                        <input
                          type="email"
                          value={selectedAdminEmail}
                          onChange={(e) => setSelectedAdminEmail(e.target.value)}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="admin@example.com"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Confirmation Code *</label>
                        <input
                          type="text"
                          value={confirmationCode}
                          onChange={(e) => setConfirmationCode(e.target.value)}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter confirmation code"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <button
                        type="submit"
                        className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200"
                      >
                        Confirm Admin
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowConfirmAdmin(false)}
                        className="bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 px-6 py-3 rounded-xl font-medium transition-all duration-200 border border-gray-500/20"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Admin List */}
              <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
                <div className="p-6 border-b border-white/10">
                  <h3 className="text-xl font-semibold text-white">Admin Accounts ({admins.length})</h3>
                </div>
                
                {admins.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-400">No admin accounts found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-white/5">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Admin</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Created</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {admins.map((admin) => (
                          <tr key={admin.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                  <span className="text-white font-semibold text-sm">
                                    {(admin.name || admin.email).charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-white font-medium">{admin.name}</p>
                                  <p className="text-gray-400 text-sm">{admin.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                admin.is_active
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {admin.is_active ? 'Active' : 'Pending'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-300">
                              {new Date(admin.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                {!admin.is_active && (
                                  <button
                                    onClick={() => {
                                      setSelectedAdminEmail(admin.email);
                                      setShowConfirmAdmin(true);
                                    }}
                                    className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-blue-500/10 transition-colors"
                                    title="Confirm Admin"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    setResetAdminEmail(admin.email);
                                    setShowAdminReset(true);
                                  }}
                                  className="text-yellow-400 hover:text-yellow-300 p-2 rounded-lg hover:bg-yellow-500/10 transition-colors"
                                  title="Reset Password"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => deleteAdmin(admin.id)}
                                  className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                                  title="Delete Admin"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Activity Logs Tab */}
          {activeTab === 'logs' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4">System Activity Logs</h3>
                <p className="text-gray-300 mb-6">
                  Monitor system activity and user actions. Logs are automatically generated for security and audit purposes.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
                <div className="p-6 border-b border-white/10">
                  <h3 className="text-xl font-semibold text-white">Recent Activity ({activityLogs.length})</h3>
                </div>
                
                {activityLogs.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-400">No activity logs found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-white/5">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Activity</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Details</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {activityLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                  <span className="text-white text-sm">📝</span>
                                </div>
                                <span className="text-white font-medium">{log.activity_type}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-gray-300">{log.user_email}</p>
                              <p className="text-gray-400 text-sm">ID: {log.user_id}</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-gray-300 text-sm max-w-xs truncate">{log.details}</p>
                            </td>
                            <td className="px-6 py-4 text-gray-300">
                              {new Date(log.created_at).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Admin Password Reset Modal */}
      {showAdminReset && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 max-w-md w-full">
            <h3 className="text-xl font-semibold text-white mb-6">Reset Admin Password</h3>
            
            {!resetCodeSent ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Admin Email</label>
                  <input
                    type="email"
                    value={resetAdminEmail}
                    onChange={(e) => setResetAdminEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="admin@example.com"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={requestAdminReset}
                    className="flex-1 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200"
                  >
                    Send Reset Code
                  </button>
                  <button
                    onClick={() => setShowAdminReset(false)}
                    className="flex-1 bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 px-4 py-3 rounded-xl font-medium transition-all duration-200 border border-gray-500/20"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); resetAdminPassword(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Reset Code</label>
                  <input
                    type="text"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter reset code"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                  <input
                    type="password"
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter new password"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={resetConfirmPassword}
                    onChange={(e) => setResetConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirm new password"
                    required
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200"
                  >
                    Reset Password
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAdminReset(false)}
                    className="flex-1 bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 px-4 py-3 rounded-xl font-medium transition-all duration-200 border border-gray-500/20"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 