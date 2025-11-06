'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { useAuth as useFirebaseAuth, useFirestore } from '@/firebase';
import { setDoc, doc, getDoc } from 'firebase/firestore';

interface AdminAuthContextType {
  isAdmin: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  isAuthLoading: boolean;
  user: any;
}

const AuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'admin@darpan.wears';
const ADMIN_PASSWORD = 'darpan2011';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, isUserLoading: isFirebaseUserLoading } = useUser();
  const auth = useFirebaseAuth();
  const firestore = useFirestore();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAdmin = async () => {
      setIsAuthLoading(isFirebaseUserLoading);
      if (isFirebaseUserLoading) {
        return;
      }
      
      if (user && user.email === ADMIN_EMAIL && firestore) {
          const adminRoleRef = doc(firestore, 'roles_admin', user.uid);
          const docSnap = await getDoc(adminRoleRef);
          setIsAdmin(docSnap.exists());
      } else {
        setIsAdmin(false);
      }
      setIsAuthLoading(false);
    };
    checkAdmin();
  }, [user, isFirebaseUserLoading, firestore]);

  const login = async (password: string): Promise<boolean> => {
    if (password !== ADMIN_PASSWORD) {
      return false;
    }

    setIsAuthLoading(true);
    try {
      // First, try to sign in.
      const userCredential = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
      if (firestore) {
        const adminRoleRef = doc(firestore, 'roles_admin', userCredential.user.uid);
        await setDoc(adminRoleRef, { isAdmin: true }, { merge: true });
      }
    } catch (error: any) {
      // If user doesn't exist, create it.
      if (error.code === 'auth/user-not-found') {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
          if (firestore) {
            const adminRoleRef = doc(firestore, 'roles_admin', userCredential.user.uid);
            await setDoc(adminRoleRef, { isAdmin: true });
          }
        } catch (creationError) {
          console.error("Admin user creation failed:", creationError);
          setIsAuthLoading(false);
          return false;
        }
      } else {
        console.error("Admin login failed:", error);
        setIsAuthLoading(false);
        return false;
      }
    }
    
    // On success for either path
    setIsAdmin(true);
    setIsAuthLoading(false);
    router.push('/admin');
    return true;
  };

  const logout = () => {
    signOut(auth).then(() => {
        setIsAdmin(false);
        if (pathname.startsWith('/admin')) {
            router.push('/login');
        }
    });
  };

  const value = { isAdmin, login, logout, isAuthLoading, user };

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
