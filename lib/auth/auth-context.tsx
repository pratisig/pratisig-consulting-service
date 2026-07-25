'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Permission, Role } from '@prisma/client';

interface User {
  id: string;
  name?: string | null;
  email: string;
  role: Role;
  status: string;
  image?: string | null;
  permissions: Permission[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (name: string, email: string, password: string, phone?: string, role?: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    try {
      const res = await fetch('/api/auth/session');
      const data = await res.json();
      if (data.user) {
        // Fetch full user data
        const userRes = await fetch('/api/auth/me');
        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData.user);
        } else {
          setUser(data.user);
        }
      }
    } catch (e) {
      console.error('Session check failed:', e);
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error || 'Erreur de connexion' };
      setUser(data.user);
      return {};
    } catch (e) {
      return { error: 'Erreur réseau' };
    }
  }

  async function register(name: string, email: string, password: string, phone?: string, role?: string): Promise<{ error?: string }> {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone, role }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error || 'Erreur d\'inscription' };
      // Auto-login after register
      return login(email, password);
    } catch (e) {
      return { error: 'Erreur réseau' };
    }
  }

  async function logout() {
    await fetch('/api/auth/session', { method: 'POST' });
    setUser(null);
    window.location.href = '/login';
  }

  function hasPermission(permission: Permission): boolean {
    if (!user) return false;
    return user.permissions.includes(permission);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
