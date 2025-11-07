
'use client';

import React, { createContext, useContext, ReactNode } from 'react';

interface AdminAuthContextType {
  isAdmin: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  isAuthLoading: boolean;
}

const AuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // We are making the admin panel public, so we just return true/false here.
  const value = { 
    isAdmin: true, 
    login: async () => true, 
    logout: () => {}, 
    isAuthLoading: false 
  };

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
