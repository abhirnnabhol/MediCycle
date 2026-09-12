import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('medicycle_token');
      if (token) {
        try {
          const res = await api.getMe();
          if (res.success) {
            setUser(res.user);
          } else {
            localStorage.removeItem('medicycle_token');
          }
        } catch (err) {
          console.warn('Session expired or invalid:', err.message);
          localStorage.removeItem('medicycle_token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.login({ email, password });
      if (res.success && res.token) {
        localStorage.setItem('medicycle_token', res.token);
        setUser(res.user);
        addToast(`Welcome back, ${res.user.name}!`, 'success');
        return res.user;
      }
    } catch (err) {
      addToast(err.message || 'Login failed. Please check your credentials.', 'error');
      throw err;
    }
  };

  const register = async (userData, autoLogin = false) => {
    try {
      const res = await api.register(userData);
      if (res.success) {
        if (autoLogin && res.token) {
          localStorage.setItem('medicycle_token', res.token);
          setUser(res.user);
          addToast(`Account created! Welcome to MediCycle, ${res.user.name}.`, 'success');
        } else {
          addToast(`Account created successfully! Please log in to continue.`, 'success');
        }
        return res.user;
      }
    } catch (err) {
      addToast(err.message || 'Registration failed.', 'error');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('medicycle_token');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Quick switch for demo presentation
  const demoLogin = async (type) => {
    let email = 'aarav@example.com';
    let password = 'password123';

    if (type === 'admin') {
      email = 'admin@medicycle.demo';
    } else if (type === 'pharmacist') {
      email = 'pharmacist@medicycle.demo';
    } else if (type === 'priya') {
      email = 'priya@example.com';
    } else {
      // General User (Aarav Patel - can both donate and request)
      email = 'aarav@example.com';
    }

    try {
      return await login(email, password);
    } catch (err) {
      addToast(`Demo login error: ${err.message}`, 'error');
    }
  };

  const refreshUser = async () => {
    try {
      const res = await api.getMe();
      if (res.success) {
        setUser(res.user);
        return res.user;
      }
    } catch (err) {
      console.warn('Failed to refresh user:', err.message);
    }
    return null;
  };

  const isAdmin = user?.role === 'admin' || user?.email === 'admin@medicycle.demo';
  const isPharmacist = !isAdmin && (user?.role === 'pharmacist' || user?.email === 'pharmacist@medicycle.demo' || user?.email === 'admin@medicycle.org');
  const isUser = user && !isAdmin && !isPharmacist;

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    demoLogin,
    refreshUser,
    isAdmin,
    isPharmacist,
    isUser,
    // Demo persona markers (for greetings/scenario highlights only)
    isPersonA: user?.email === 'aarav@example.com',
    isPersonB: user?.email === 'priya@example.com',
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
