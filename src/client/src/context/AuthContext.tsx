import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import socket from '../api';
import type { AuthUser } from '../types';

interface AuthContextValue {
  username: string;
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  login: (name: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState(() => localStorage.getItem('wn_user') || '');
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('wn_user');
    return saved ? { username: saved } : null;
  });

  useEffect(() => {
    if (username && !user) {
      setUser({ username });
    }
  }, [username, user]);

  function login(name: string) {
    const trimmed = name.trim();
    localStorage.setItem('wn_user', trimmed);
    setUsername(trimmed);
    setUser({ username: trimmed });
  }

  function logout() {
    socket.disconnect();
    localStorage.removeItem('wn_user');
    setUsername('');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ username, user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
