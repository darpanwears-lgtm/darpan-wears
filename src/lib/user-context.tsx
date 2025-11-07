
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserContextType {
  instagramUser: string | null;
  setInstagramUser: (username: string | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [instagramUser, setInstagramUserInternal] = useState<string | null>(null);

  useEffect(() => {
    // On initial load, try to get the user from localStorage
    const storedUser = localStorage.getItem('featuredInstagramUser');
    if (storedUser) {
      setInstagramUserInternal(storedUser);
    }
  }, []);

  const setInstagramUser = (username: string | null) => {
    if (username) {
      localStorage.setItem('featuredInstagramUser', username);
    } else {
      localStorage.removeItem('featuredInstagramUser');
    }
    setInstagramUserInternal(username);
  };

  const value = {
    instagramUser,
    setInstagramUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};
