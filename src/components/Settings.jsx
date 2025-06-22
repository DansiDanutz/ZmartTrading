import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

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
      showMessage(error.response?.data?.error || 'Failed to reset password', true);
    }
  };

  // Admin Deletion Functions
  const deleteAdmin = async (adminId) => {
    if (!window.confirm('Are you sure you want to delete this admin?')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/auth/delete-admin`, {
        data: { admin_id: adminId },
        withCredentials: true
      });
      
      showMessage('Admin deleted successfully');
      fetchAdmins();
    } catch (error) {
      showMessage(error.response?.data?.error || 'Failed to delete admin', true);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!user?.is_superadmin) {
    return (
      <div className="p-8">
        <div className="text-center text-red-500">
          Access denied. SuperAdmin privileges required.
        </div>
      </div>
    );
  }

  const renderPasswordTab = () => (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-white mb-4">🔐 Change SuperAdmin Password</h2>
      
      {!showPasswordChange ? (
        <button
          onClick={() => setShowPasswordChange(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Change Password
        </button>
      ) : (
        <div className="space-y-4">
          {!codeSent ? (
            <button
              onClick={requestPasswordChange}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Send Verification Code
            </button>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={passwordCode}
                  onChange={(e) => setPasswordCode(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Enter 6-digit code"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Confirm new password"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={changePassword}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Change Password
                </button>
                <button
                  onClick={() => {
                    setShowPasswordChange(false);
                    setCodeSent(false);
                    setPasswordCode('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderAdminManagementTab = () => (
    <div className="space-y-6">
      {/* Admin Creation Section */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">👤 Create New Admin</h2>
        
        {!showCreateAdmin ? (
          <button
            onClick={() => setShowCreateAdmin(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Create Admin
          </button>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Admin Email
              </label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Admin Name
              </label>
              <input
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="Admin Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Temporary Password
              </label>
              <input
                type="password"
                value={tempPassword}
                onChange={(e) => setTempPassword(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="Temporary password"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={createAdmin}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Create Admin
              </button>
              <button
                onClick={() => {
                  setShowCreateAdmin(false);
                  setAdminEmail('');
                  setAdminName('');
                  setTempPassword('');
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Admin Confirmation Section */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">✅ Confirm Pending Admins</h2>
        
        {!showConfirmAdmin ? (
          <button
            onClick={() => setShowConfirmAdmin(true)}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Confirm Admin
          </button>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Admin Email
              </label>
              <select
                value={selectedAdminEmail}
                onChange={(e) => setSelectedAdminEmail(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Select an admin...</option>
                {admins.filter(admin => !admin.is_active && !admin.is_superadmin).map(admin => (
                  <option key={admin.id} value={admin.email}>
                    {admin.email} - {admin.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirmation Code
              </label>
              <input
                type="text"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="Enter confirmation code"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={confirmAdmin}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Confirm Admin
              </button>
              <button
                onClick={() => {
                  setShowConfirmAdmin(false);
                  setConfirmationCode('');
                  setSelectedAdminEmail('');
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Admin Password Reset Section */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">🔑 Reset Admin Password</h2>
        
        {!showAdminReset ? (
          <button
            onClick={() => setShowAdminReset(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Reset Admin Password
          </button>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Admin Email
              </label>
              <input
                type="email"
                value={resetAdminEmail}
                onChange={(e) => setResetAdminEmail(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="admin@example.com"
              />
            </div>
            
            {!resetCodeSent ? (
              <button
                onClick={requestAdminReset}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Send Reset Code
              </button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Reset Code
                  </label>
                  <input
                    type="text"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="Enter reset code"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={resetConfirmPassword}
                    onChange={(e) => setResetConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="Confirm new password"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={resetAdminPassword}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Reset Password
                  </button>
                  <button
                    onClick={() => {
                      setShowAdminReset(false);
                      setResetAdminEmail('');
                      setResetCode('');
                      setResetNewPassword('');
                      setResetConfirmPassword('');
                      setResetCodeSent(false);
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Admin List Section */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">📋 Admin List</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-600">
                <th className="px-4 py-2 text-gray-300">Name</th>
                <th className="px-4 py-2 text-gray-300">Email</th>
                <th className="px-4 py-2 text-gray-300">Status</th>
                <th className="px-4 py-2 text-gray-300">Created</th>
                <th className="px-4 py-2 text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map(admin => (
                <tr key={admin.id} className="border-b border-gray-700">
                  <td className="px-4 py-2 text-white">{admin.name}</td>
                  <td className="px-4 py-2 text-white">{admin.email}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      admin.is_superadmin 
                        ? 'bg-purple-600 text-white' 
                        : admin.is_active 
                          ? 'bg-green-600 text-white' 
                          : 'bg-yellow-600 text-white'
                    }`}>
                      {admin.is_superadmin ? 'SuperAdmin' : admin.is_active ? 'Active' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-300">
                    {new Date(admin.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">
                    {!admin.is_superadmin && (
                      <button
                        onClick={() => deleteAdmin(admin.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderActivityLogsTab = () => (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-white mb-4">📊 Activity Logs</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-600">
              <th className="px-4 py-2 text-gray-300">Time</th>
              <th className="px-4 py-2 text-gray-300">User</th>
              <th className="px-4 py-2 text-gray-300">Action</th>
              <th className="px-4 py-2 text-gray-300">Details</th>
              <th className="px-4 py-2 text-gray-300">IP Address</th>
            </tr>
          </thead>
          <tbody>
            {activityLogs.map(log => (
              <tr key={log.id} className="border-b border-gray-700">
                <td className="px-4 py-2 text-gray-300">
                  {new Date(log.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-2 text-white">{log.user_email}</td>
                <td className="px-4 py-2">
                  <span className="px-2 py-1 rounded text-xs bg-blue-600 text-white">
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-2 text-gray-300 text-sm max-w-xs truncate">
                  {log.details}
                </td>
                <td className="px-4 py-2 text-gray-300 text-sm">
                  {log.ip_address}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {logsPagination.pages > 1 && (
        <div className="mt-4 flex justify-center space-x-2">
          <button
            onClick={() => {
              setLogsPage(logsPage - 1);
              fetchActivityLogs();
            }}
            disabled={!logsPagination.has_prev}
            className="px-3 py-1 bg-gray-600 text-white rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1 text-gray-300">
            Page {logsPage} of {logsPagination.pages}
          </span>
          <button
            onClick={() => {
              setLogsPage(logsPage + 1);
              fetchActivityLogs();
            }}
            disabled={!logsPagination.has_next}
            className="px-3 py-1 bg-gray-600 text-white rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-300">SuperAdmin Control Panel</p>
      </div>

      {/* Messages */}
      {message && (
        <div className="mb-4 p-4 bg-green-500 text-white rounded-lg">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-500 text-white rounded-lg">
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-600">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('password')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'password'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            🔐 Password Change
          </button>
          <button
            onClick={() => setActiveTab('admins')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'admins'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            👥 Admin Management
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'logs'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            📊 Activity Logs
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'password' && renderPasswordTab()}
      {activeTab === 'admins' && renderAdminManagementTab()}
      {activeTab === 'logs' && renderActivityLogsTab()}
    </div>
  );
} 