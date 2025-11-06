'use client';

import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useUser, useAuth as useFirebaseAuth } from '@/firebase'; // Using the new firebase hooks
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import {
  initiateEmailSignUp,
  initiateEmailSignIn,
} from '@/firebase/non-blocking-login';
import { signOut } from 'firebase/auth';

interface AuthContextType {
  user: any | null; // Using 'any' for now, can be replaced with a proper User type from firebase
  isAdmin: boolean;
  isUserLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => void;
  logout: () => void;
  signup: (email: string, password?: string) => void;
  makeAdmin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, isUserLoading } = useUser();
  const auth = useFirebaseAuth();
  const firestore = useFirestore();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user && firestore) {
        const adminRoleRef = doc(firestore, 'roles_admin', user.uid);
        const adminDoc = await getDoc(adminRoleRef);
        setIsAdmin(adminDoc.exists());
      } else {
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user, firestore]);

  const login = (email: string, password?: string) => {
    if (auth && password) {
      initiateEmailSignIn(auth, email, password);
    }
  };

  const signup = (email: string, password?: string) => {
    if (auth && password) {
      initiateEmailSignUp(auth, email, password);
    }
  };

  const logout = () => {
    if (auth) {
      signOut(auth);
    }
  };
  
  const makeAdmin = async () => {
    if (user && firestore) {
        const adminRoleRef = doc(firestore, 'roles_admin', user.uid);
        await setDoc(adminRoleRef, { admin: true });
        setIsAdmin(true); // Optimistically update admin state
    }
  }


  const isAuthenticated = !!user && !isUserLoading;

  return (
    <AuthContext.Provider value={{ user, isUserLoading, isAuthenticated, isAdmin, login, logout, signup, makeAdmin }}>
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
