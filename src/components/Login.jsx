import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Forgot password states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [codeSent, setCodeSent] = useState(false);

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

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/login`, {
        email,
        password
      }, { withCredentials: true });

      if (response.data.message) {
        showMessage('Login successful');
        if (onLogin) {
          onLogin(response.data.user);
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      showMessage(errorMessage, true);
    } finally {
      setLoading(false);
    }
  };

  const requestResetCode = async () => {
    if (!resetEmail) {
      showMessage('Please enter your email address', true);
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/auth/request-reset-code`, {
        email: resetEmail
      });
      setCodeSent(true);
      showMessage('Reset code sent to your email');
    } catch (error) {
      showMessage(error.response?.data?.error || 'Failed to send reset code', true);
    }
  };

  const resetPassword = async () => {
    if (newPassword !== confirmPassword) {
      showMessage('Passwords do not match', true);
      return;
    }

    if (newPassword.length < 6) {
      showMessage('Password must be at least 6 characters', true);
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/auth/verify-reset-code`, {
        email: resetEmail,
        code: resetCode,
        new_password: newPassword
      });
      
      showMessage('Password reset successfully');
      setShowForgotPassword(false);
      setResetEmail('');
      setResetCode('');
      setNewPassword('');
      setConfirmPassword('');
      setCodeSent(false);
    } catch (error) {
      showMessage(error.response?.data?.error || 'Failed to reset password', true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Sign in to ZmartTrading
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Access your trading dashboard
          </p>
        </div>

        {/* Messages */}
        {message && (
          <div className="p-4 bg-green-500 text-white rounded-lg">
            {message}
          </div>
        )}
        {error && (
          <div className="p-4 bg-red-500 text-white rounded-lg">
            {error}
          </div>
        )}

        {!showForgotPassword ? (
          // Login Form
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white bg-gray-700 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white bg-gray-700 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="font-medium text-blue-400 hover:text-blue-300"
                >
                  Forgot your password?
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        ) : (
          // Forgot Password Form
          <div className="mt-8 space-y-6">
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="reset-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="reset-email"
                  name="reset-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white bg-gray-700 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                />
              </div>
              
              {codeSent && (
                <>
                  <div>
                    <label htmlFor="reset-code" className="sr-only">
                      Reset Code
                    </label>
                    <input
                      id="reset-code"
                      name="reset-code"
                      type="text"
                      required
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder="6-digit reset code"
                    />
                  </div>
                  <div>
                    <label htmlFor="new-password" className="sr-only">
                      New Password
                    </label>
                    <input
                      id="new-password"
                      name="new-password"
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder="New password"
                    />
                  </div>
                  <div>
                    <label htmlFor="confirm-password" className="sr-only">
                      Confirm Password
                    </label>
                    <input
                      id="confirm-password"
                      name="confirm-password"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white bg-gray-700 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder="Confirm new password"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex space-x-2">
              {!codeSent ? (
                <button
                  onClick={requestResetCode}
                  className="flex-1 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Send Reset Code
                </button>
              ) : (
                <button
                  onClick={resetPassword}
                  className="flex-1 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Reset Password
                </button>
              )}
              <button
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetEmail('');
                  setResetCode('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setCodeSent(false);
                }}
                className="flex-1 py-2 px-4 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Back to Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 