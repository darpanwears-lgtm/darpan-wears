'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AdminAuthContextType {
  isAdmin: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  isAuthLoading: boolean;
}

const AuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const ADMIN_PASSWORD = 'darpan2025';
const SESSION_STORAGE_KEY = 'darpan-admin-auth';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const storedAuth = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (storedAuth === 'true') {
        setIsAdmin(true);
      }
    } catch (e) {
      console.error("Session storage is not available.");
    }
    setIsAuthLoading(false);
  }, []);

  const login = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
      setIsAdmin(true);
      router.push('/admin');
      return true;
    }
    return false;
  };

  const logout = () => {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    setIsAdmin(false);
    if (pathname.startsWith('/admin')) {
        router.push('/login');
    }
  };

  const value = { isAdmin, login, logout, isAuthLoading };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
