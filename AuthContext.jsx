import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem('ss_user'));
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUser);
  const [ready, setReady] = useState(!localStorage.getItem('ss_token'));

  const persist = (token, u) => {
    if (token) localStorage.setItem('ss_token', token);
    localStorage.setItem('ss_user', JSON.stringify(u));
    setUser(u);
  };

  const logout = useCallback(() => {
    localStorage.removeItem('ss_token');
    localStorage.removeItem('ss_user');
    setUser(null);
  }, []);

  // refresh the user from the server on load (also validates the stored token)
  useEffect(() => {
    if (!localStorage.getItem('ss_token')) return;
    api
      .get('/auth/me')
      .then(({ data }) => persist(null, data.user))
      .catch(() => logout())
      .finally(() => setReady(true));
  }, [logout]);

  useEffect(() => {
    window.addEventListener('ss:logout', logout);
    return () => window.removeEventListener('ss:logout', logout);
  }, [logout]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    persist(data.token, data.user);
    return data.user;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    persist(data.token, data.user);
    return data.user;
  };

  const updateUser = (u) => persist(null, u);

  return (
    <AuthContext.Provider value={{ user, ready, login, register, logout, updateUser, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}
