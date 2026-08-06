import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('hrms_user') || 'null');
    } catch {
      localStorage.removeItem('hrms_user');
      return null;
    }
  });
  const [token,   setToken]   = useState(() => localStorage.getItem('hrms_token') || '');
  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { username, password });
      const { token: t, user: u } = res.data;
      localStorage.setItem('hrms_token', t);
      localStorage.setItem('hrms_user', JSON.stringify(u));
      setToken(t);
      setUser(u);
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err.response?.data?.message || 'Đăng nhập thất bại' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('hrms_token');
    localStorage.removeItem('hrms_user');
    setToken('');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAdmin: user?.role === 'admin', isManager: user?.role === 'manager' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
