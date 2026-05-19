import React, { createContext, useContext, useEffect, useState } from 'react';

import api from '../lib/api';

const AuthContext = createContext(null);
const STORAGE_KEY = 'altercom.auth.v2';

export function AuthProvider({ children }) {
  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = window.localStorage.getItem(STORAGE_KEY);

    if (!storedToken) {
      setLoading(false);
      return;
    }

    setToken(storedToken);

    api
      .get('/auth/me', storedToken)
      .then(currentUser => {
        setUser(currentUser);
      })
      .catch(() => {
        window.localStorage.removeItem(STORAGE_KEY);
        setToken('');
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  async function login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    setToken(response.token);
    setUser(response.user);
    window.localStorage.setItem(STORAGE_KEY, response.token);
    return response.user;
  }

  function logout() {
    window.localStorage.removeItem(STORAGE_KEY);
    setToken('');
    setUser(null);
  }

  async function refreshProfile(currentToken = token) {
    if (!currentToken) {
      return null;
    }

    const currentUser = await api.get('/auth/me', currentToken);
    setUser(currentUser);
    return currentUser;
  }

  return (
    <AuthContext.Provider
      value={{
        login,
        logout,
        refreshProfile,
        token,
        user,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
