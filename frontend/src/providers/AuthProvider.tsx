import React, { createContext, useContext, useEffect, useState } from 'react';

import { api } from '../services/api';
import { AuthStorage, LoginResponse, User } from '../types/models';

interface AuthContextValue {
  token: string;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  registerSupervisor: (
    payload: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      avatar?: string;
    }
  ) => Promise<User>;
  logout: () => Promise<void>;
  refreshProfile: (currentToken?: string) => Promise<User | null>;
}

const STORAGE_KEY = 'altercom.auth.v4';
const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredSession(): AuthStorage | null {
  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as AuthStorage;

    if (parsed && typeof parsed.accessToken === 'string') {
      return parsed;
    }
  } catch (error) {
    if (typeof raw === 'string' && raw.trim()) {
      return {
        accessToken: raw,
        refreshToken: ''
      };
    }
  }

  return null;
}

function persistSession(accessToken: string, refreshToken: string): void {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      accessToken,
      refreshToken
    } satisfies AuthStorage)
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [token, setToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedSession = readStoredSession();

    if (!storedSession) {
      setLoading(false);
      return;
    }

    setToken(storedSession.accessToken);
    setRefreshToken(storedSession.refreshToken);

    api
      .get<User>('/auth/me', storedSession.accessToken)
      .then(currentUser => {
        setUser(currentUser);
      })
      .catch(async (err) => {
        if (process.env.NODE_ENV !== 'production') {
          console.debug('[AuthProvider] /auth/me failed on startup', err instanceof Error ? err.message : err);
        }

        if (!storedSession.refreshToken) {
          window.localStorage.removeItem(STORAGE_KEY);
          setToken('');
          setRefreshToken('');
          setUser(null);
          return;
        }

        try {
          const refreshed = await api.post<LoginResponse>('/auth/refresh', {
            refreshToken: storedSession.refreshToken
          });

          if (process.env.NODE_ENV !== 'production') {
            console.debug('[AuthProvider] refresh response on startup', refreshed);
          }

          setToken(refreshed.accessToken);
          setRefreshToken(refreshed.refreshToken);
          setUser(refreshed.user);
          persistSession(refreshed.accessToken, refreshed.refreshToken);
        } catch (refreshError) {
          if (process.env.NODE_ENV !== 'production') {
            console.debug('[AuthProvider] refresh failed on startup', refreshError instanceof Error ? refreshError.message : refreshError);
          }
          window.localStorage.removeItem(STORAGE_KEY);
          setToken('');
          setRefreshToken('');
          setUser(null);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  async function login(email: string, password: string): Promise<User> {
    const response = await api.post<LoginResponse>('/auth/login', { email, password });

    if (process.env.NODE_ENV !== 'production') {
      console.debug('[AuthProvider] login response', response);
    }

    setToken(response.accessToken);
    setRefreshToken(response.refreshToken);
    setUser(response.user);
    persistSession(response.accessToken, response.refreshToken);

    return response.user;
  }

  async function registerSupervisor(payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    avatar?: string;
  }): Promise<User> {
    const response = await api.post<LoginResponse>('/auth/register-supervisor', payload);

    if (process.env.NODE_ENV !== 'production') {
      console.debug('[AuthProvider] register response', response);
    }

    setToken(response.accessToken);
    setRefreshToken(response.refreshToken);
    setUser(response.user);
    persistSession(response.accessToken, response.refreshToken);

    return response.user;
  }

  async function logout(): Promise<void> {
    const currentRefreshToken = refreshToken;

    window.localStorage.removeItem(STORAGE_KEY);
    setToken('');
    setRefreshToken('');
    setUser(null);

    if (!currentRefreshToken) {
      return;
    }

    try {
      await api.post('/auth/logout', { refreshToken: currentRefreshToken });
    } catch (error) {
      // Ignore logout failures after local cleanup.
    }
  }

  async function refreshProfile(currentToken: string = token): Promise<User | null> {
    if (!currentToken) {
      return null;
    }

    const profile = await api.get<User>('/auth/me', currentToken);
    setUser(profile);
    return profile;
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        login,
        registerSupervisor,
        logout,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth doit etre utilise dans AuthProvider.');
  }

  return context;
}
