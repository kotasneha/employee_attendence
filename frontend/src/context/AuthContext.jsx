import React, { createContext, useContext, useEffect, useState } from 'react';
import api, { setAuthToken } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('attendance_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('attendance_token') || null);

  useEffect(() => {
    if (token) {
      setAuthToken(token);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    setUser(res.data.user);
    setToken(res.data.token);
    localStorage.setItem('attendance_user', JSON.stringify(res.data.user));
    localStorage.setItem('attendance_token', res.data.token);
    setAuthToken(res.data.token);
  };

  const register = async (payload) => {
    const res = await api.post('/auth/register', payload);
    setUser(res.data.user);
    setToken(res.data.token);
    localStorage.setItem('attendance_user', JSON.stringify(res.data.user));
    localStorage.setItem('attendance_token', res.data.token);
    setAuthToken(res.data.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('attendance_user');
    localStorage.removeItem('attendance_token');
    setAuthToken(null);
  };

  const value = { user, token, login, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
