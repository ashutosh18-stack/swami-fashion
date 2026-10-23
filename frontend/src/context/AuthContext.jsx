import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [idleSecondsLeft, setIdleSecondsLeft] = useState(300); // 5 minutes (300s)
  const [absoluteSecondsLeft, setAbsoluteSecondsLeft] = useState(1800); // 30 minutes
  const [sessionExpiryNotice, setSessionExpiryNotice] = useState(null);

  // Check current session status with server (using passive header so polling does not extend idle timer)
  const checkSession = useCallback(async () => {
    try {
      const res = await api.getSessionStatus(true);
      if (res.authenticated && res.admin) {
        setAdmin(res.admin);
        setIsAuthenticated(true);
        if (res.remainingIdleSeconds !== undefined) setIdleSecondsLeft(res.remainingIdleSeconds);
        if (res.remainingAbsoluteSeconds !== undefined) setAbsoluteSecondsLeft(res.remainingAbsoluteSeconds);
      } else {
        setAdmin(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      if (err.data?.code === 'SESSION_IDLE_TIMEOUT') {
        handleSessionExpired('Your admin session has expired. Please log in again.');
      } else if (err.data?.code === 'SESSION_ABSOLUTE_TIMEOUT') {
        handleSessionExpired('Your session exceeded maximum lifetime (30 minutes). Please log in again.');
      } else {
        setAdmin(null);
        setIsAuthenticated(false);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSessionExpired = (message) => {
    setAdmin(null);
    setIsAuthenticated(false);
    setSessionExpiryNotice(message);
    setIdleSecondsLeft(0);
  };

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Client-side idle timer countdown
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      setIdleSecondsLeft(prev => {
        if (prev <= 1) {
          handleSessionExpired('Your admin session has expired. Please log in again.');
          return 0;
        }
        return prev - 1;
      });

      setAbsoluteSecondsLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Periodic passive sync with backend every 40 seconds
  useEffect(() => {
    if (!isAuthenticated) return;
    const syncInterval = setInterval(() => {
      checkSession();
    }, 40000);
    return () => clearInterval(syncInterval);
  }, [isAuthenticated, checkSession]);

  // Reset idle countdown when the admin performs intentional user interactions
  const recordAdminActivity = useCallback(() => {
    if (isAuthenticated) {
      setIdleSecondsLeft(300); // Reset to 5 minutes
    }
  }, [isAuthenticated]);

  // Direct Username & Password Login (No Code / PIN required)
  const login = async (username, password) => {
    setSessionExpiryNotice(null);
    const res = await api.verifyPassword(username, password);
    if (res.success && res.admin) {
      setAdmin(res.admin);
      setIsAuthenticated(true);
      setIdleSecondsLeft(300);
      setAbsoluteSecondsLeft(1800);
    }
    return res;
  };

  const verifyPassword = login;

  // Step 2: 6-Digit PIN Verification (Fallback / Legacy)
  const verifyPin = async (tempToken, pin) => {
    const res = await api.verifyPin(tempToken, pin);
    if (res.success && res.admin) {
      setAdmin(res.admin);
      setIsAuthenticated(true);
      setIdleSecondsLeft(300);
      setAbsoluteSecondsLeft(1800);
      setSessionExpiryNotice(null);
    }
    return res;
  };

  // Logout
  const logout = async () => {
    try {
      await api.logout();
    } catch (e) {
      // Ignored
    } finally {
      setAdmin(null);
      setIsAuthenticated(false);
      setSessionExpiryNotice(null);
    }
  };

  return (
    <AuthContext.Provider value={{
      admin,
      isAuthenticated,
      isLoading,
      idleSecondsLeft,
      absoluteSecondsLeft,
      sessionExpiryNotice,
      clearSessionExpiryNotice: () => setSessionExpiryNotice(null),
      recordAdminActivity,
      login,
      verifyPassword,
      verifyPin,
      logout,
      refreshSession: checkSession
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
